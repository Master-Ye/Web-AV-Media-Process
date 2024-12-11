import { Button } from '@nextui-org/react';
import { Combinator } from '@webav/av-cliper';
import React from 'react';
import { useEffect, useState } from 'react';

export function CombinatorPlay({
  list,
  onStart,
  com,
  stream,
  mediaType = 'video',
}: {
  onStart: () => void;
  com?: Combinator | null;
  list?: string[];
  stream?: ReadableStream | null;
  mediaType?: 'video' | 'audio';
}) {
  const [state, setState] = useState('');
  const [videoSrc, setVideoSrc] = useState('');

  useEffect(() => {
    (async () => {
      if (com == null && stream == null) return;
      setState('合成中...');
      const timeStart = performance.now();
      const srcBlob = await new Response(com?.output() ?? stream).blob();
      setVideoSrc(URL.createObjectURL(srcBlob));
      setState(`合成耗时: ${Math.round(performance.now() - timeStart)}ms`);
    })();
  }, [com, stream]);
  return (
    <div>
      <Button
      color='secondary'
        onClick={() => {
          setState('loading...');
          onStart();
        }}
        style={{ marginBottom: 16 }}
      >
        启动！
      </Button>
      {list&& list.length > 0 && (
        <div className="resouse-list">
          素材：
          {list.map((it) => (
            <a
              href={it}
              target="_blank"
              key={it}
              style={{ marginRight: '16px', textDecoration: 'none' }}
            >
              {it}
            </a>
          ))}
        </div>
      )}
      <div className="state">
        {state}
        {videoSrc.length > 0 && (
          <a
            href={videoSrc}
            download={`avprocess-${Date.now()}.${
              mediaType === 'video' ? 'mp4' : 'm4a'
            }`}
            target="_self"
            style={{ marginLeft: '16px', textDecoration: 'none' }}
          >
           {'导出' + (mediaType === 'video'?'视频':'音频')}
          </a>
        )}
      </div>
      {videoSrc.length > 0 &&
        (mediaType === 'video' ? (
          <video
            src={videoSrc}
            controls
            autoPlay
            style={{
              width: '600px',
              height: '333px',
              display: 'block',
            }}
          ></video>
        ) : (
          <audio src={videoSrc} controls autoPlay></audio>
        ))}
    </div>
  );
}