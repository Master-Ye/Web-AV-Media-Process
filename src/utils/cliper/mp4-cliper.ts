import { IClip } from "./icliper";
import { file, tmpfile, write } from 'opfs-tools';
import { MP4Info, MP4Sample } from '@webav/mp4box.js';
import {
  extractFileConfig,
  quickParseMP4File,
} from '../mp4-utils';
function isOTFile(obj: any) {
  return obj.kind === 'file' && obj.createReader instanceof Function;
}
// 用于内部创建 MP4Clip 实例
type MPClipCloneArgs = Awaited<ReturnType<typeof mp4FileToSamples>> & {
  localFile: OPFSToolFile;
};

interface MP4DecoderConf {
  video: VideoDecoderConfig | null;
  audio: AudioDecoderConfig | null;
}

interface MP4ClipOpts {
  audio?: boolean | { volume: number };
  /**
   * 不安全，随时可能废弃
   */
  __unsafe_hardwareAcceleration__?: HardwarePreference;
}

type ExtMP4Sample = Omit<MP4Sample, 'data'> & {
  is_idr: boolean;
  deleted?: boolean;
  data: null | Uint8Array;
};

type LocalFileReader = Awaited<ReturnType<OPFSToolFile['createReader']>>;

type ThumbnailOpts = {
  start: number;
  end: number;
  step: number;
};
type OPFSToolFile = ReturnType<typeof file>;
let CLIP_ID = 0;
export class MP4Clip implements IClip {
    #insId = CLIP_ID++;


    ready

    #destroyed = false;

    #meta = {
      // 微秒
      duration: 0,
      width: 0,
      height: 0,
      audioSampleRate: 0,
      audioChanCount: 0,
    };

    get meta() {
      return { ...this.#meta };
    }

    #localFile: OPFSToolFile;

    #volume = 1;

    #videoSamples: ExtMP4Sample[] = [];

    #audioSamples: ExtMP4Sample[] = [];

    #videoFrameFinder: VideoFrameFinder | null = null;
    #audioFrameFinder: AudioFrameFinder | null = null;

    #decoderConf: {
      video: VideoDecoderConfig | null;
      audio: AudioDecoderConfig | null;
    } = {
      video: null,
      audio: null,
    };

    #opts: MP4ClipOpts = { audio: true };

    constructor(
      source: OPFSToolFile | ReadableStream<Uint8Array> | MPClipCloneArgs,
      opts: MP4ClipOpts = {},
    ) {
      if (
        !(source instanceof ReadableStream) &&
        !isOTFile(source) &&
        !Array.isArray(source.videoSamples)
      ) {
        throw Error('Illegal argument');
      }

      this.#opts = { audio: true, ...opts };
      this.#volume =
        typeof opts.audio === 'object' && 'volume' in opts.audio
          ? opts.audio.volume
          : 1;

      const initByStream = async (s: ReadableStream) => {
        await write(this.#localFile, s);
        return this.#localFile;
      };

      this.#localFile = isOTFile(source)
        ? source
        : 'localFile' in source
          ? source.localFile // from clone
          : tmpfile();

      this.ready = (
        source instanceof ReadableStream
          ? initByStream(source).then((otFile) =>
              mp4FileToSamples(otFile, this.#opts),
            )
          : isOTFile(source)
            ? mp4FileToSamples(source, this.#opts)
            : Promise.resolve(source)
      ).then(async ({ videoSamples, audioSamples, decoderConf }) => {
        this.#videoSamples = videoSamples;
        this.#audioSamples = audioSamples;
        this.#decoderConf = decoderConf;
        const { videoFrameFinder, audioFrameFinder } = genDecoder(
          {
            video:
              decoderConf.video == null
                ? null
                : {
                    ...decoderConf.video,
                    hardwareAcceleration:
                      this.#opts.__unsafe_hardwareAcceleration__,
                  },
            audio: decoderConf.audio,
          },
          await this.#localFile.createReader(),
          videoSamples,
          audioSamples,
          this.#opts.audio !== false ? this.#volume : 0,
        );
        this.#videoFrameFinder = videoFrameFinder;
        this.#audioFrameFinder = audioFrameFinder;

        this.#meta = genMeta(decoderConf, videoSamples, audioSamples);
        this.#log.info('MP4Clip meta:', this.#meta);
        return { ...this.#meta };
      });
    }

    /**
     * 拦截 {@link MP4Clip.tick} 方法返回的数据，用于对图像、音频数据二次处理
     * @param time 调用 tick 的时间
     * @param tickRet tick 返回的数据
     *
     * @see [移除视频绿幕背景](https://bilibili.github.io/WebAV/demo/3_2-chromakey-video)
     */
    tickInterceptor: <T extends Awaited<ReturnType<MP4Clip['tick']>>>(
      time: number,
      tickRet: T,
    ) => Promise<T> = async (_, tickRet) => tickRet;

    /**
     * 获取素材指定时刻的图像帧、音频数据
     * @param time 微秒
     */
    async tick(time: number): Promise<{
      video?: VideoFrame;
      audio: Float32Array[];
      state: 'success' | 'done';
    }> {
      if (time >= this.#meta.duration) {
        return await this.tickInterceptor(time, {
          audio: (await this.#audioFrameFinder?.find(time)) ?? [],
          state: 'done',
        });
      }

      const [audio, video] = await Promise.all([
        this.#audioFrameFinder?.find(time) ?? [],
        this.#videoFrameFinder?.find(time),
      ]);

      if (video == null) {
        return await this.tickInterceptor(time, {
          audio,
          state: 'success',
        });
      }

      return await this.tickInterceptor(time, {
        video,
        audio,
        state: 'success',
      });
    }

    #thumbAborter = new AbortController();
    /**
     * 生成缩略图，默认每个关键帧生成一个 100px 宽度的缩略图。
     *
     * @param imgWidth 缩略图宽度，默认 100
     * @param opts Partial<ThumbnailOpts>
     * @returns Promise<Array<{ ts: number; img: Blob }>>
     */
    // async thumbnails(
    //   imgWidth = 100,
    //   opts?: Partial<ThumbnailOpts>,
    // ): Promise<Array<{ ts: number; img: Blob }>> {
    //   this.#thumbAborter.abort();
    //   this.#thumbAborter = new AbortController();
    //   const aborterSignal = this.#thumbAborter.signal;

    //   await this.ready;
    //   const abortMsg = 'generate thumbnails aborted';
    //   if (aborterSignal.aborted) throw Error(abortMsg);

    //   const { width, height } = this.#meta;
    //   const convtr = createVF2BlobConvtr(
    //     imgWidth,
    //     Math.round(height * (imgWidth / width)),
    //     { quality: 0.1, type: 'image/png' },
    //   );

    //   return new Promise<Array<{ ts: number; img: Blob }>>(
    //     async (resolve, reject) => {
    //       let pngPromises: Array<{ ts: number; img: Promise<Blob> }> = [];
    //       const vc = this.#decoderConf.video;
    //       if (vc == null || this.#videoSamples.length === 0) {
    //         resolver();
    //         return;
    //       }
    //       aborterSignal.addEventListener('abort', () => {
    //         reject(Error(abortMsg));
    //       });

    //       async function resolver() {
    //         if (aborterSignal.aborted) return;
    //         resolve(
    //           await Promise.all(
    //             pngPromises.map(async (it) => ({
    //               ts: it.ts,
    //               img: await it.img,
    //             })),
    //           ),
    //         );
    //       }

    //       function pushPngPromise(vf: VideoFrame) {
    //         pngPromises.push({
    //           ts: vf.timestamp,
    //           img: convtr(vf),
    //         });
    //       }

    //       const { start = 0, end = this.#meta.duration, step } = opts ?? {};
    //       if (step) {
    //         let cur = start;
    //         // 创建一个新的 VideoFrameFinder 实例，避免与 tick 方法共用而导致冲突
    //         const videoFrameFinder = new VideoFrameFinder(
    //           await this.#localFile.createReader(),
    //           this.#videoSamples,
    //           {
    //             ...vc,
    //             hardwareAcceleration: this.#opts.__unsafe_hardwareAcceleration__,
    //           },
    //         );
    //         while (cur <= end && !aborterSignal.aborted) {
    //           const vf = await videoFrameFinder.find(cur);
    //           if (vf) pushPngPromise(vf);
    //           cur += step;
    //         }
    //         videoFrameFinder.destroy();
    //         resolver();
    //       } else {
    //         await thumbnailByKeyFrame(
    //           this.#videoSamples,
    //           this.#localFile,
    //           vc,
    //           aborterSignal,
    //           { start, end },
    //           (vf, done) => {
    //             if (vf != null) pushPngPromise(vf);
    //             if (done) resolver();
    //           },
    //         );
    //       }
    //     },
    //   );
    // }

    async split(time: number) {
      await this.ready;

      if (time <= 0 || time >= this.#meta.duration)
        throw Error('"time" out of bounds');

      const [preVideoSlice, postVideoSlice] = splitVideoSampleByTime(
        this.#videoSamples,
        time,
      );
      const [preAudioSlice, postAudioSlice] = splitAudioSampleByTime(
        this.#audioSamples,
        time,
      );
      const preClip = new MP4Clip(
        {
          localFile: this.#localFile,
          videoSamples: preVideoSlice ?? [],
          audioSamples: preAudioSlice ?? [],
          decoderConf: this.#decoderConf,
        },
        this.#opts,
      );
      const postClip = new MP4Clip(
        {
          localFile: this.#localFile,
          videoSamples: postVideoSlice ?? [],
          audioSamples: postAudioSlice ?? [],
          decoderConf: this.#decoderConf,
        },
        this.#opts,
      );
      await Promise.all([preClip.ready, postClip.ready]);

      return [preClip, postClip] as [this, this];
    }

    async clone() {
      await this.ready;
      const clip = new MP4Clip(
        {
          localFile: this.#localFile,
          videoSamples: [...this.#videoSamples],
          audioSamples: [...this.#audioSamples],
          decoderConf: this.#decoderConf,
        },
        this.#opts,
      );
      await clip.ready;
      clip.tickInterceptor = this.tickInterceptor;
      return clip as this;
    }

    /**
     * 拆分 MP4Clip 为仅包含视频轨道和音频轨道的 MP4Clip
     * @returns Mp4CLip[]
     */
    async splitTrack() {
      await this.ready;
      const clips: MP4Clip[] = [];
      if (this.#videoSamples.length > 0) {
        const videoClip = new MP4Clip(
          {
            localFile: this.#localFile,
            videoSamples: [...this.#videoSamples],
            audioSamples: [],
            decoderConf: {
              video: this.#decoderConf.video,
              audio: null,
            },
          },
          this.#opts,
        );
        await videoClip.ready;
        videoClip.tickInterceptor = this.tickInterceptor;
        clips.push(videoClip);
      }
      if (this.#audioSamples.length > 0) {
        const audioClip = new MP4Clip(
          {
            localFile: this.#localFile,
            videoSamples: [],
            audioSamples: [...this.#audioSamples],
            decoderConf: {
              audio: this.#decoderConf.audio,
              video: null,
            },
          },
          this.#opts,
        );
        await audioClip.ready;
        audioClip.tickInterceptor = this.tickInterceptor;
        clips.push(audioClip);
      }

      return clips;
    }

    destroy(): void {
      if (this.#destroyed) return;
    //   this.#log.info('MP4Clip destroy');
      this.#destroyed = true;

      this.#videoFrameFinder?.destroy();
      this.#audioFrameFinder?.destroy();
    }
  }








  async function mp4FileToSamples(otFile: OPFSToolFile, opts: MP4ClipOpts = {}) {
    let mp4Info: MP4Info | null = null;
    const decoderConf: MP4DecoderConf = { video: null, audio: null };
    let videoSamples: ExtMP4Sample[] = [];
    let audioSamples: ExtMP4Sample[] = [];

    let videoDeltaTS = -1;
    let audioDeltaTS = -1;
    const reader = await otFile.createReader();
    await quickParseMP4File(
      reader,
      (data) => {
        mp4Info = data.info;
        let { videoDecoderConf: vc, audioDecoderConf: ac } = extractFileConfig(
          data.mp4boxFile,
          data.info,
        );
        decoderConf.video = vc ?? null;
        decoderConf.audio = ac ?? null;
        if (vc == null && ac == null) {
          Log.error('MP4Clip no video and audio track');
        }
        Log.info(
          'mp4BoxFile moov ready',
          {
            ...data.info,
            tracks: null,
            videoTracks: null,
            audioTracks: null,
          },
          decoderConf,
        );
      },
      (_, type, samples) => {
        if (type === 'video') {
          if (videoDeltaTS === -1) videoDeltaTS = samples[0].dts;
          for (const s of samples) {
            videoSamples.push(normalizeTimescale(s, videoDeltaTS, 'video'));
          }
        } else if (type === 'audio' && opts.audio) {
          if (audioDeltaTS === -1) audioDeltaTS = samples[0].dts;
          for (const s of samples) {
            audioSamples.push(normalizeTimescale(s, audioDeltaTS, 'audio'));
          }
        }
      },
    );
    await reader.close();

    const lastSampele = videoSamples.at(-1) ?? audioSamples.at(-1);
    // if (mp4Info == null) {
    //   throw Error('MP4Clip stream is done, but not emit ready');
    // } else if (lastSampele == null) {
    //   throw Error('MP4Clip stream not contain any sample');
    // }
    // 修复首帧黑帧
    fixFirstBlackFrame(videoSamples);
    // Log.info('mp4 stream parsed');
    return {
      videoSamples,
      audioSamples,
      decoderConf,
    };

    function normalizeTimescale(
      s: MP4Sample,
      delta = 0,
      sampleType: 'video' | 'audio',
    ) {
      // todo: perf 丢弃多余字段，小尺寸对象性能更好
      const is_idr =
        sampleType === 'video' &&
        s.is_sync &&
        isIDRFrame(s.data, s.description.type);
      let offset = s.offset;
      let size = s.size;
      if (is_idr) {
        // 当 IDR 帧前面携带 SEI 数据可能导致解码失败
        // 所以此处通过控制 offset、size 字段 跳过 SEI 数据
        const seiLen = seiLenOfStart(s.data, s.description.type);
        offset += seiLen;
        size -= seiLen;
      }
      return {
        ...s,
        is_idr,
        offset,
        size,
        cts: ((s.cts - delta) / s.timescale) * 1e6,
        dts: ((s.dts - delta) / s.timescale) * 1e6,
        duration: (s.duration / s.timescale) * 1e6,
        timescale: 1e6,
        // 音频数据量可控，直接保存在内存中
        data: sampleType === 'video' ? null : s.data,
      };
    }
  }






  function isIDRFrame(u8Arr: Uint8Array, type: MP4Sample['description']['type']) {
    if (type !== 'avc1' && type !== 'hvc1') return true;

    const dv = new DataView(u8Arr.buffer);
    let i = 0;
    for (; i < u8Arr.byteLength - 4; ) {
      if (type === 'avc1' && (dv.getUint8(i + 4) & 0x1f) === 5) {
        return true;
      } else if (type === 'hvc1') {
        const nalUnitType = (dv.getUint8(i + 4) >> 1) & 0x3f;
        if (nalUnitType === 19 || nalUnitType === 20) return true;
      }
      // 跳至下一个 NALU 继续检查
      i += dv.getUint32(i) + 4;
    }
    return false;
  }

// 获取起始位置的 SEI 长度
function seiLenOfStart(
  u8Arr: Uint8Array,
  type: MP4Sample['description']['type'],
) {
  if (type !== 'avc1' && type !== 'hvc1') return 0;

  const dv = new DataView(u8Arr.buffer);
  if (type === 'avc1' && (dv.getUint8(4) & 0x1f) === 6) {
    return dv.getUint32(0) + 4;
  }
  if (type === 'hvc1') {
    const nalUnitType = (dv.getUint8(4) >> 1) & 0x3f;
    if (nalUnitType === 39 || nalUnitType === 40) {
      return dv.getUint32(0) + 4;
    }
  }
  return 0;
}

// 如果第一帧出现的时间偏移较大，会导致第一帧为黑帧，这里尝试自动消除第一帧前的黑帧
function fixFirstBlackFrame(samples: ExtMP4Sample[]) {
  let iframeCnt = 0;
  let minCtsSample: ExtMP4Sample | null = null;
  // cts 最小表示视频的第一帧
  for (const s of samples) {
    if (s.deleted) continue;
    // 最多检测两个 I 帧之间的帧
    if (s.is_sync) iframeCnt += 1;
    if (iframeCnt >= 2) break;

    if (minCtsSample == null || s.cts < minCtsSample.cts) {
      minCtsSample = s;
    }
  }
  // 200ms 是经验值，自动消除 200ms 内的黑帧，超过则不处理
  if (minCtsSample != null && minCtsSample.cts < 200e3) {
    minCtsSample.duration += minCtsSample.cts;
    minCtsSample.cts = 0;
  }
}

class VideoFrameFinder {
  #dec: VideoDecoder | null = null;
  constructor(
    public localFileReader: LocalFileReader,
    public samples: ExtMP4Sample[],
    public conf: VideoDecoderConfig,
  ) {}

  #ts = 0;
  #curAborter = { abort: false, st: performance.now() };
  find = async (time: number): Promise<VideoFrame | null> => {
    if (this.#dec == null || time <= this.#ts || time - this.#ts > 3e6) {
      this.#reset(time);
    }

    this.#curAborter.abort = true;
    this.#ts = time;

    this.#curAborter = { abort: false, st: performance.now() };
    return await this.#parseFrame(time, this.#dec, this.#curAborter);
  };

  // fix VideoFrame duration is null
  #lastVfDur = 0;

  #downgradeSoftDecode = false;
  #videoDecCusorIdx = 0;
  #videoFrames: VideoFrame[] = [];
  #outputFrameCnt = 0;
  #inputChunkCnt = 0;
  #parseFrame = async (
    time: number,
    dec: VideoDecoder | null,
    aborter: { abort: boolean; st: number },
  ): Promise<VideoFrame | null> => {
    if (dec == null || dec.state === 'closed' || aborter.abort) return null;

    if (this.#videoFrames.length > 0) {
      const vf = this.#videoFrames[0];
      if (time < vf.timestamp) return null;
      // 弹出第一帧
      this.#videoFrames.shift();
      // 第一帧过期，找下一帧
      if (time > vf.timestamp + (vf.duration ?? 0)) {
        vf.close();
        return await this.#parseFrame(time, dec, aborter);
      }

      if (this.#videoFrames.length < 10) {
        // 预解码 避免等待
        this.#startDecode(dec).catch((err) => {
          this.#reset(time);
          throw err;
        });
      }
      // 符合期望
      return vf;
    }

    // 缺少帧数据
    if (
      this.#decoding ||
      (this.#outputFrameCnt < this.#inputChunkCnt && dec.decodeQueueSize > 0)
    ) {
      if (performance.now() - aborter.st > 6e3) {
        throw Error(
          `MP4Clip.tick video timeout, ${JSON.stringify(this.#getState())}`,
        );
      }
      // 解码中，等待，然后重试
      await sleep(15);
    } else if (this.#videoDecCusorIdx >= this.samples.length) {
      // decode completed
      return null;
    } else {
      try {
        await this.#startDecode(dec);
      } catch (err) {
        this.#reset(time);
        throw err;
      }
    }
    return await this.#parseFrame(time, dec, aborter);
  };

  #decoding = false;
  #startDecode = async (dec: VideoDecoder) => {
    if (this.#decoding) return;
    this.#decoding = true;

    // 启动解码任务，然后重试
    let endIdx = this.#videoDecCusorIdx + 1;
    // 该 GoP 时间区间有时间匹配，且未被删除的帧
    let hasValidFrame = false;
    for (; endIdx < this.samples.length; endIdx++) {
      const s = this.samples[endIdx];
      if (!hasValidFrame && !s.deleted) {
        hasValidFrame = true;
      }
      // 找一个 GoP，所以是下一个 IDR 帧结束
      if (s.is_idr) break;
    }

    if (hasValidFrame) {
      const samples = this.samples.slice(this.#videoDecCusorIdx, endIdx);
      if (samples[0]?.is_idr !== true) {
        Log.warn('First sample not idr frame');
      } else {
        const chunks = await videosamples2Chunks(samples, this.localFileReader);
        // Wait for the previous asynchronous operation to complete, at which point the task may have already been terminated
        if (dec.state === 'closed') return;

        this.#lastVfDur = chunks[0]?.duration ?? 0;
        decodeGoP(dec, chunks, {
          onDecodingError: (err) => {
            if (this.#downgradeSoftDecode) {
              throw err;
            } else if (this.#outputFrameCnt === 0) {
              this.#downgradeSoftDecode = true;
              Log.warn('Downgrade to software decode');
              this.#reset();
            }
          },
        });

        this.#inputChunkCnt += chunks.length;
      }
    }
    this.#videoDecCusorIdx = endIdx;
    this.#decoding = false;
  };

  #reset = (time?: number) => {
    this.#decoding = false;
    this.#videoFrames.forEach((f) => f.close());
    this.#videoFrames = [];
    if (time == null || time === 0) {
      this.#videoDecCusorIdx = 0;
    } else {
      let keyIdx = 0;
      for (let i = 0; i < this.samples.length; i++) {
        const s = this.samples[i];
        if (s.is_idr) keyIdx = i;
        if (s.cts < time) continue;
        this.#videoDecCusorIdx = keyIdx;
        break;
      }
    }
    this.#inputChunkCnt = 0;
    this.#outputFrameCnt = 0;
    if (this.#dec?.state !== 'closed') this.#dec?.close();
    this.#dec = new VideoDecoder({
      output: (vf) => {
        this.#outputFrameCnt += 1;
        if (vf.timestamp === -1) {
          vf.close();
          return;
        }
        let rsVf = vf;
        if (vf.duration == null) {
          rsVf = new VideoFrame(vf, {
            duration: this.#lastVfDur,
          });
          vf.close();
        }
        this.#videoFrames.push(rsVf);
      },
      error: (err) => {
        // Log.error(`MP4Clip VideoDecoder err: ${err.message}`);
      },
    });
    this.#dec.configure({
      ...this.conf,
      ...(this.#downgradeSoftDecode
        ? { hardwareAcceleration: 'prefer-software' }
        : {}),
    });
  };

  #getState = () => ({
    time: this.#ts,
    decState: this.#dec?.state,
    decQSize: this.#dec?.decodeQueueSize,
    decCusorIdx: this.#videoDecCusorIdx,
    sampleLen: this.samples.length,
    inputCnt: this.#inputChunkCnt,
    outputCnt: this.#outputFrameCnt,
    cacheFrameLen: this.#videoFrames.length,
    softDeocde: this.#downgradeSoftDecode,
  });

  destroy = () => {
    if (this.#dec?.state !== 'closed') this.#dec?.close();
    this.#dec = null;
    this.#curAborter.abort = true;
    this.#videoFrames.forEach((f) => f.close());
    this.#videoFrames = [];
    this.localFileReader.close();
  };
}