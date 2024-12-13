// 下面是视频解码的处理逻辑，使用mp4box.js获取视频信息
// 使用 Webcodecs API 进行解码
const mp4url = './rains-s.mp4';
const mp4box = MP4Box.createFile();

// 这个是额外的处理方法，不需要关心里面的细节
const getExtradata = () => {
    // 生成VideoDecoder.configure需要的description信息
    const entry = mp4box.moov.traks[0].mdia.minf.stbl.stsd.entries[0];

    const box = entry.avcC ?? entry.hvcC ?? entry.vpcC;
    if (box != null) {
        const stream = new DataStream(
            undefined,
            0,
            DataStream.BIG_ENDIAN
        )
        box.write(stream)
         // slice()方法的作用是移除moov box的header信息
        return new Uint8Array(stream.buffer.slice(8))
    }
};

// 视频轨道，解码用
let videoTrack = null;
let videoDecoder = null;
// 这个就是最终解码出来的视频画面序列文件
const videoFrames = [];

let nbSampleTotal = 0;
let countSample = 0;

mp4box.onReady = function (info) {
    // 记住视频轨道信息，onSamples匹配的时候需要
    videoTrack = info.videoTracks[0];

    if (videoTrack != null) {
        mp4box.setExtractionOptions(videoTrack.id, 'video', {
            nbSamples: 100
        })
    }

    // 视频的宽度和高度
    const videoW = videoTrack.track_width;
    const videoH = videoTrack.track_height;

    // 设置视频解码器
    videoDecoder = new VideoDecoder({
        output: (videoFrame) => {
            createImageBitmap(videoFrame).then((img) => {
                videoFrames.push({
                    img,
                    duration: videoFrame.duration,
                    timestamp: videoFrame.timestamp
                });
                videoFrame.close();
            });
        },
        error: (err) => {
            console.error('videoDecoder错误：', err);
        }
    });

    nbSampleTotal = videoTrack.nb_samples;

    videoDecoder.configure({
        codec: videoTrack.codec,
        codedWidth: videoW,
        codedHeight: videoH,
        description: getExtradata()
    });

    mp4box.start();
};

mp4box.onSamples = function (trackId, ref, samples) {
    // samples其实就是采用数据了
    if (videoTrack.id === trackId) {
        mp4box.stop();

        countSample += samples.length;

        for (const sample of samples) {
            const type = sample.is_sync ? 'key' : 'delta';

            const chunk = new EncodedVideoChunk({
                type,
                timestamp: sample.cts,
                duration: sample.duration,
                data: sample.data
            });

            videoDecoder.decode(chunk);
        }

        if (countSample === nbSampleTotal) {
            videoDecoder.flush();
        }
    }
};

// 获取视频的arraybuffer数据
fetch(mp4url).then(res => res.arrayBuffer()).then(buffer => {
    // 因为文件较小，所以直接一次性写入
    // 如果文件较大，则需要res.body.getReader()创建reader对象，每次读取一部分数据
    // reader.read().then(({ done, value })
    buffer.fileStart = 0;
    mp4box.appendBuffer(buffer);
    mp4box.flush();
});
const draw = () => {
    const { img, timestamp, duration } = videoFrames[index];

    // 清除画布
    context.clearRect(0, 0, canvas.width, canvas.height);
    // 混合模式设为正常
    context.globalCompositeOperation = 'source-over';
    // 绘制图片，bgImg是背景图
    context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    // 使用 screen 混合模式
    context.globalCompositeOperation = 'screen';
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 开始下一帧绘制
    index++;

    if (index === videoFrames.length) {
        // 重新开始
        index = 0;
    }

    setTimeout(draw, duration);
}