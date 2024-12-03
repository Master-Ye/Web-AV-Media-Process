import { useState, useEffect } from 'react';
import { Combinator, MP4Clip, OffscreenSprite } from '@webav/av-cliper';
import { assetsPrefix, downloadFromStream } from '../utils/utils.ts';
import { Button } from '@nextui-org/react';
import React from 'react';

const videoSrc = assetsPrefix(['video/bunny_0.mp4']);

let videoClip;
let audioTrackClip;
async function start() {
  const clip = new MP4Clip((await fetch(videoSrc[0])).body!);
  await clip.ready;
  [videoClip, audioTrackClip] = await clip.splitTrack();
}

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

  useEffect(() => {
    (async () => {
      if (ctx == null) return;
      await start();
    })();
  }, [ctx]);

  return (
    <div>
      <div className="flex items-center">
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
        <Button onClick={async ()=>{
            const spr1 = new OffscreenSprite(
                videoClip
              );
              const spr2 = new OffscreenSprite(
                audioTrackClip
              );
              const com = new Combinator({ width: videoClip.meta.width, height: videoClip.meta.height, });

              await com.addSprite(spr1);
            //   await com.addSprite(spr2);

            downloadFromStream(com.output(),'video.mp4')
        }}></Button>
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