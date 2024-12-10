import { useEffect, useState } from 'react';
import { MP4Clip } from '@webav/av-cliper';
import { assetsPrefix } from '../utils/utils.ts';
import { Button, Chip, Image, Input, Radio, RadioGroup } from "@nextui-org/react";
import React from 'react';
import Upload from '../components/upload.tsx';


const resList = assetsPrefix(['video/bunny.mp4']);


// async function startWork(start?, end?, step?) {
//     const clip = new MP4Clip(video);
//     await clip.ready;
//     let t = performance.now();
//     let imgList
//     if (start) {
//         imgList = await clip.thumbnails(500, {
//             start,
//             end,
//             step
//         })
//     }
//     else {
//         imgList = await clip.thumbnails(500);
//     }
//     const cost = ((performance.now() - t) / 1000).toFixed(2);
//     return {
//         imgList,
//         cost,
//     };
// }

export default function UI() {
    const [imgList, setImgList] = useState<Array<{ ts: number; img: string }>>(
        [],
    );
    const [cost, setCost] = useState('0');
    const [selected, setSelected] = React.useState("0");
    const [startTime, setStartTime] = React.useState("");
    const [endTime, setEndTime] = React.useState("");
    const [step, setStep] = React.useState("");
    const [clip, setClip] = useState<MP4Clip | null>(null);  // 保存clip实例
    const [video, setVideo] = useState<ReadableStream | null>(null);  // 保存video实例
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        // 如果视频源或clip为空，创建新的clip
        if (video) {
            console.log(11)
            const newClip = new MP4Clip(video);
            setClip(newClip);
        }
    }, [video]);
    useEffect(() => {
        let video: ReadableStream;
        (async () => {
            const response = await fetch(resList[0]);
            video = response.body!;
            setVideo(video)  // 获取视频的 ReadableStream
        })()
    }, []);
    // startWork函数修改为复用clip
    async function startWork(start?, end?, step?) {
        if (!clip) {
            console.error("Clip is not initialized");
            return { imgList: [], cost: "0" };
        }
        setLoading(true)
        await clip.ready;
        const t = performance.now();
        let imgList;

        if (start) {
            imgList = await clip.thumbnails(500, { start, end, step });
        } else {
            imgList = await clip.thumbnails(500);
        }
        setLoading(false)
        const cost = ((performance.now() - t) / 1000).toFixed(2);
        return { imgList, cost };
    }

    const start = () => {
        (async () => {
            if (selected === '0') {
                const { imgList, cost } = await startWork();
                setImgList(
                    imgList.map((it) => ({
                        ts: it.ts,
                        img: URL.createObjectURL(it.img),
                    })),
                );
                setCost(cost);
            }
            else {
                const { imgList, cost } = await startWork(Number(startTime) * 1e6, Number(endTime) * 1e6, Number(step) * 1e6);
                setImgList(
                    imgList.map((it) => ({
                        ts: it.ts,
                        img: URL.createObjectURL(it.img),
                    })),
                );
                setCost(cost);
            }
        }
        )();
    }
    //   useEffect(() => {
    //     (async () => {
    //       const { imgList, cost } = await start();
    //       setImgList(
    //         imgList.map((it) => ({
    //           ts: it.ts,
    //           img: URL.createObjectURL(it.img),
    //         })),
    //       );
    //       setCost(cost);
    //     })();
    //   }, []);

    return (
        <>
            <div>
                <RadioGroup
                    label="请选择取帧方式"
                    value={selected}
                    onValueChange={setSelected}
                >
                    <Radio value="0">自动取关键帧</Radio>
                    <Radio value="1">自定义</Radio>
                </RadioGroup>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                    <Input
                        width='300px'
                        type='number'
                        label="开始时间"
                        placeholder="输入"
                        value={startTime}
                        onValueChange={setStartTime}
                    />
                    <Input
                        type='number'
                        label="结束时间"
                        placeholder="输入"
                        value={endTime}
                        onValueChange={setEndTime}
                    />
                    <Input
                        type='number'
                        label="步长时间"
                        placeholder="输入"
                        value={step}
                        onValueChange={setStep}
                    />
                </div>
                <Upload
                    text='上传视频'
                    onFileChange={async (file) => {
                        if (!file) {
                            let video
                            (async () => {
                                const response = await fetch(resList[0]);
                                video = response.body!;
                                setVideo(video)  // 获取视频的 ReadableStream
                            })()
                        }
                        else setVideo(file)
                    }}
                    fileType={['video/mp4']}
                    maxCount={1}></Upload>
                <Button onClick={start} color='primary'>开始/重新开始</Button>
                <Chip isDisabled color="warning" variant="shadow">若未上传则使用默认视频演示</Chip>
                <div>
                    {loading ? 'loading' : (imgList.length ? `耗时：${cost}s，关键帧数：${imgList.length}` : '')}
                </div>
                {/* <br /> */}
                <div className="flex flex-wrap">
                    {imgList.map((it) => (
                        <div key={it.ts}>
                            <div className="text-center">{(it.ts / 1e6).toFixed(2)}s</div>
                            <Image src={it.img} isBlurred isZoomed className='ml-12'></Image>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}