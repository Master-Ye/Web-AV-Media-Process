import { useState, useEffect } from 'react';
import { Combinator, MP4Clip, OffscreenSprite } from '@webav/av-cliper';
import { assetsPrefix, downloadFromStream } from '../utils/utils.ts';
import { Button } from '@nextui-org/react';
import React from 'react';
import Upload from '../components/upload.tsx';

const videoSrc = assetsPrefix(['video/bunny_0.mp4']);

let videoClip;
let audioTrackClip;


let videoTimer = 0;
function playVideo(ctx) {
  let startTime = performance.now();

  stopAudio();
  stopVideo();
  videoTimer = setInterval(async () => {
    const { state, video } = await videoClip.tick(
      Math.round((performance.now() - startTime) * 1000),
    );
    if (state === 'done') {
      clearInterval(videoTimer);
      return;
    }
    if (video != null && state === 'success') {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
      video.close();
    }
  }, 1000 / 30);
}

function stopVideo() {
  clearInterval(videoTimer);
}

const audioCtx = new AudioContext();
let audioSource, audioTimer;
async function playAudio() {
  // 当前片段的开始播放的时间
  let startAt = 0;
  let startTime = performance.now();

  stopAudio();
  stopVideo();
  audioTimer = setInterval(async () => {
    const { state, audio } = await audioTrackClip.tick(
      Math.round((performance.now() - startTime) * 1000),
    );
    if (state === 'done') {
      clearInterval(audioTimer);
      return;
    }
    const len = audio?.[0]?.length ?? 0;
    if (len === 0) return;
    const buf = audioCtx.createBuffer(2, len, 48000);
    buf.copyToChannel(audio[0], 0);
    buf.copyToChannel(audio[1], 1);
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = buf;
    audioSource.connect(audioCtx.destination);
    startAt = Math.max(audioCtx.currentTime, startAt);
    audioSource.start(startAt);

    startAt += buf.duration;
  }, 1000 / 30);
}
function stopAudio() {
  audioSource?.stop();
  clearInterval(audioTimer);
}

export default function UI() {
  const [ctx, setCtx] = useState<null | undefined | CanvasRenderingContext2D>();
  const [clip, setClip] = useState<MP4Clip | null>(null);  // 保存clip实例
  const [video, setVideo] = useState<ReadableStream | null>(null);
  const [videoClip, setVideoClip] = useState<MP4Clip | null>(null);
  const [audioTrackClip, setAudioTrackClip] = useState<MP4Clip | null>(null);
  // useEffect(() => {
  //   (async () => {
  //     if (ctx == null) return;
  //     await start();
  //   })();
  // }, [ctx]);
  async function start() {
    if (!clip) {
      console.error("Clip is not initialized");
      return
    }
    await clip.ready;
    const [videoClip, audioTrackClip] = await clip.splitTrack();
    setVideoClip(videoClip)
    setAudioTrackClip(audioTrackClip)
  }
  useEffect(() => {
    let video: ReadableStream;
    (async () => {
      const response = await fetch(videoSrc[0]);
      video = response.body!;
      setVideo(video)  // 获取视频的 ReadableStream
    })()
  }, []);
  useEffect(() => {
    // 如果视频源或clip为空，创建新的clip
    if (video) {
      console.log(11)
      const newClip = new MP4Clip(video);
      setClip(newClip);
    }
  }, [video]);

  return (
    <div>
      <div className="flex items-center">
        <Button onClick={start}>开始解析</Button>
        <Button
          onClick={() => {
            playVideo(ctx);
          }}
        >
          播放视频
        </Button>{' '}
        ｜
        <Button
          onClick={() => {
            playAudio();
          }}
        >
          播放音频
        </Button>
        <Upload maxCount={1} fileType={['video/mp4']} onFileChange={(file) => {
          if (!file) {
            let video: ReadableStream;
            (async () => {
              const response = await fetch(videoSrc[0]);
              video = response.body!;
              setVideo(video)  // 获取视频的 ReadableStream
            })()
          }
          else {
            setVideo(file)
          }
        }}></Upload>
        <Button onClick={async () => {
          console.log(videoClip,audioTrackClip)
          if(!videoClip||!audioTrackClip) return
          const spr1 = new OffscreenSprite(
            videoClip
          );
          const spr2 = new OffscreenSprite(
            audioTrackClip
          );
          const com1 = new Combinator({ width: videoClip.meta.width, height: videoClip.meta.height, });
          const com2 = new Combinator();
          await com1.addSprite(spr1);
          await com2.addSprite(spr2);

          await downloadFromStream(com1.output(), 'video.mp4')
          await downloadFromStream(com2.output(), 'audio.mp3')
          com1.destroy()
          com2.destroy()
        }}>下载</Button>
      </div>
      <canvas
        className="w-full"
        width={900}
        height={500}
        ref={(c) => {
          setCtx(c?.getContext('2d'));
        }}
      />
    </div>
  );
}