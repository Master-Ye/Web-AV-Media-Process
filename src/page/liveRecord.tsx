import { Button } from '@nextui-org/react';
import { AVCanvas } from '@webav/av-canvas';
import {
  ImgClip,
  MediaStreamClip,
  VisibleSprite,
  renderTxt2ImgBitmap,
} from '@webav/av-cliper';
import { AVRecorder } from '@webav/av-recorder';
import React from 'react';
import { useEffect, useState } from 'react';

function createEl(tagName: string): HTMLElement {
  return document.createElement(tagName);
}

// let avCvs: AVCanvas | null = null;
// function initCvs(attchEl: HTMLDivElement | null) {
//     console.log(attchEl)
//   if (attchEl == null) return;
//   avCvs = new AVCanvas(attchEl, {
//     bgColor: 'black',
//     width: 1920,
//     height: 1080,
//   });
//   avCvs.play({ start: 0, end: Infinity });
// }

let recorder: AVRecorder | null = null;


export default function UI() {
  const [avCvs, setAVCvs] = useState<AVCanvas | null>(null);
  const [stateText, setStateText] = useState('');
  const [cvsWrapEl, setCvsWrapEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (cvsWrapEl == null) return;
    avCvs?.destroy();
    const cvs = new AVCanvas(cvsWrapEl, {
      bgColor: '#000',
      width: 1280,
      height: 720,
    });
    setAVCvs(cvs);
    return () => {
      cvs.destroy();
    };
  }, [cvsWrapEl]);
  async function start() {
    if (avCvs == null) return;
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `AVP-${Date.now()}.mp4`,
    });
    const writer = await fileHandle.createWritable();
    recorder = new AVRecorder(avCvs.captureStream(), {
      bitrate: 5e6,
    });
    recorder.start().pipeTo(writer).catch(console.error);
  }
  useEffect(() => {
    return () => {
        console.log(11)
      avCvs?.destroy();
    };
  }, []);
  return (
    <>
      添加素材：
      <Button
        onClick={async () => {
          if (avCvs == null) return;
          const spr = new VisibleSprite(
            new MediaStreamClip(
              await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              }),
            ),
          );
          await avCvs.addSprite(spr);
        }}
      >
        Camera & Micphone
      </Button>
      &nbsp;
      <Button
      color='primary'
        onClick={async () => {
          if (avCvs == null) return;
          const spr = new VisibleSprite(
            new MediaStreamClip(
              await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
              }),
            ),
          );
          await avCvs.addSprite(spr);
        }}
      >
        Share screen
      </Button>
      &nbsp;
      <Button
      color='primary'
        onClick={async () => {
          if (avCvs == null) return;
          const localFile = await loadFile({
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
          });
          const opts = /\.gif$/.test(localFile.name)
            ? ({ type: 'image/gif', stream: localFile.stream() } as const)
            : localFile.stream();
          const spr = new VisibleSprite(new ImgClip(opts));
          await avCvs.addSprite(spr);
        }}
      >
        Image
      </Button>
      &nbsp;
      <Button
        onClick={async () => {
          if (avCvs == null) return;
          const videoEl = createEl('video') as HTMLVideoElement;
          videoEl.src = URL.createObjectURL(
            await loadFile({ 'video/*': ['.webm', '.mp4', '.mov', '.mkv'] }),
          );
          videoEl.loop = true;
          videoEl.autoplay = true;
          await videoEl.play();

          const spr = new VisibleSprite(
            // @ts-ignore
            new MediaStreamClip(videoEl.captureStream()),
          );
          await avCvs.addSprite(spr);
        }}
      >
        Video
      </Button>
      &nbsp;
      <Button
        onClick={async () => {
          if (avCvs == null) return;
          const audioEl = createEl('audio') as HTMLAudioElement;
          audioEl.src = URL.createObjectURL(
            await loadFile({ 'video/*': ['.mp3', '.wav', '.ogg', '.m4a'] }),
          );
          audioEl.loop = true;
          audioEl.autoplay = true;
          await audioEl.play();

          const spr = new VisibleSprite(
            // @ts-ignore
            new MediaStreamClip(audioEl.captureStream()),
          );
          await avCvs.addSprite(spr);
        }}
      >
        Audio
      </Button>
      &nbsp;
      <Button
        onClick={async () => {
          if (avCvs == null) return;
          const spr = new VisibleSprite(
            new ImgClip(
              await renderTxt2ImgBitmap(
                '示例文字',
                'font-size: 80px; color: red;',
              ),
            ),
          );
          await avCvs.addSprite(spr);
        }}
      >
        Text
      </Button>
      <hr />
      <Button
        onClick={async () => {
          await start();
          setStateText('录制中...');
        }}
      >
        Start Recod
      </Button>
      &nbsp;
      <Button
        onClick={async () => {
          await recorder?.stop();
          setStateText('视频已保存');
        }}
      >
        Stop Recod
      </Button>
      <span style={{ marginLeft: 16, color: '#666' }}>{stateText}</span>
      <div
        ref={(el)=>setCvsWrapEl(el)}
        style={{ width: 900, height: 500, position: 'relative' }}
      ></div>
    </>
  );
}

async function loadFile(accept: Record<string, string[]>) {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{ accept }],
  });
  return (await fileHandle.getFile()) as File;
}