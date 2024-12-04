import {
    AudioClip,
    Combinator,
    ImgClip,
    MP4Clip,
    OffscreenSprite,
  } from '@webav/av-cliper';
  import { useState } from 'react';
import React from 'react';
import { CombinatorPlay } from '../components/combinator-player';
import Upload from '../components/upload';
import { assetsPrefix } from '../utils/utils';

  const resList = assetsPrefix(['img/animated.gif', 'audio/44.1kHz-2chan.m4a']);

  async function start() {
    const gifSpr = new OffscreenSprite(
      new ImgClip({ type: 'image/gif', stream: (await fetch(resList[0])).body! }),
    );
    gifSpr.time = { duration: 10e6, offset: 0 };
    const audioSpr = new OffscreenSprite(
      new AudioClip((await fetch(resList[1])).body!),
    );
    audioSpr.time = { duration: 10e6, offset: 0 };
    const com = new Combinator({ width: 1280, height: 720 });
    await com.addSprite(gifSpr);
    await com.addSprite(audioSpr);
    return com;
  }

  export default function UI() {
    const [clip, setClip] = useState<MP4Clip | null>(null);  // 保存clip实例
    const [gif, setGif] = useState<ReadableStream | null>(null);
    const [mp3, setMp3] = useState<ReadableStream | null>(null);
    const [videoClip, setVideoClip] = useState<MP4Clip | null>(null);
    const [com, setCom] = useState<null | Combinator>(null);
    return (
        <>
        <Upload maxCount={1} fileType={['image/gif']} onFileChange={(file) => {
            if (!file) {
              let video: ReadableStream;
              (async () => {
                const response = await fetch(resList[0]);
                video = response.body!;
                setGif(video)  // 获取视频的 ReadableStream
              })()
            }
            else {
              setGif(file)
            }
          }}></Upload>
          <Upload maxCount={1} fileType={['video/mp4']} onFileChange={(file) => {
            if (!file) {
              let video: ReadableStream;
              (async () => {
                const response = await fetch(resList[0]);
                video = response.body!;
                setVideo(video)  // 获取视频的 ReadableStream
              })()
            }
            else {
              setVideo(file)
            }
          }}></Upload>
      <CombinatorPlay
        list={resList}
        onStart={async () => setCom(await start())}
        com={com}
      ></CombinatorPlay>
      </>
    );
  }