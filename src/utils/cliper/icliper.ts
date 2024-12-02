export interface IClip {
    /**
     * 从素材中提取指定时间数据
     * @param time 时间，单位 微秒
     */
    tick: (time: number) => Promise<{
      video?: VideoFrame | ImageBitmap | null;
      audio?: Float32Array[];
      state: 'done' | 'success';
    }>;

    /**
     * 当素材准备完成，ready 会切换到 resolved 状态
     */
    readonly ready: Promise<IClipMeta>;

    /**
     * 数据元数据
     */
    readonly meta: IClipMeta;

    /**
     * clone，返回一个新素材
     */
    clone: () => Promise<this>;

    /**
     * 按指定时间切割，返回该时刻前后两个新素材，常用于剪辑场景按时间分割素材
     *
     * 该方法不会破坏原素材的数据
     *
     * @param time 时间，微秒
     * @returns
     */
    split?: (time: number) => Promise<[this, this]>;

    /**
     * 销毁实例，释放资源
     */
    destroy: () => void;
  }

  /**
 * 默认的音频设置，⚠️ 不要变更它的值 ⚠️
 */
export const DEFAULT_AUDIO_CONF = {
    sampleRate: 48000,
    channelCount: 2,
    codec: 'mp4a.40.2',
  } as const;