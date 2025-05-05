import { AudioClip, Combinator, OffscreenSprite } from '@webav/av-cliper';
import { useState } from 'react';
import React from 'react';
import { assetsPrefix, getAudioDuration } from '../service/serviceUtils.ts';
import { CombinatorPlay } from '../components/combinator-player.tsx';
import Upload from '../components/upload.tsx';
import { Radio, RadioGroup } from '@nextui-org/react';

// const resList = assetsPrefix([
//     '44.1kHz-2chan.m4a',
//     '16kHz-1chan.mp3',
// ]);


export default function UI() {
    const [com, setCom] = useState<null | Combinator>(null);
    const [file1, setFile1] = useState<null | File>(null);
    const [file2, setFile2] = useState<null | File>(null);
    // const [file1Clip, setFile]
    const [comMethod, setComMethod] = React.useState<string>("fix");
    async function startFix() {
        if (!file1 || !file2) return null
        const duration1 = await getAudioDuration(file1);
        const duration2 = await getAudioDuration(file2)
        const audioSpr1 = new OffscreenSprite(
            new AudioClip(file1.stream(), { volume: 0.5 }),
        );
        audioSpr1.time = { offset: 0, duration: duration1 * Math.pow(10, 6) };
        const audioSpr2 = new OffscreenSprite(
            new AudioClip(file2.stream(), { volume: 0.5 }),
        );
        audioSpr2.time = { offset: 0, duration: duration2 * Math.pow(10, 6) };

        const com = new Combinator();
        await com.addSprite(audioSpr1);
        await com.addSprite(audioSpr2);
        return com;
    }
    async function startAdd() {
        if (!file1 || !file2) return null
        const clips = [new AudioClip(file1?.stream()), new AudioClip(file2?.stream())]
        const com = new Combinator();
        let offset = 0;
        for (const clip of clips) {
            const audioSpr = new OffscreenSprite(clip);
            await audioSpr.ready;
            audioSpr.time.offset = offset;
            offset += audioSpr.time.duration;
            await com.addSprite(audioSpr);
        }

        return com;
    }
    return (
        <><div>
            <Upload text='上传音频1' onFileChange={(file, File) => {
                if (File) setFile1(File)
            }} maxCount={1} fileType={['audio/mp3', 'audio/m4a', 'audio/mpeg', 'audio/x-m4a']}></Upload>
            <Upload text='上传音频2' maxCount={1}
                onFileChange={(file, File) => {
                    if (File) setFile2(File)
                }} fileType={['audio/mp3', 'audio/m4a', 'audio/mpeg', 'audio/x-m4a']}></Upload>
            <RadioGroup  orientation='horizontal' color="secondary" label="选择合成方式" value={comMethod} onValueChange={setComMethod}>
                <Radio value="fix">叠加</Radio>
                <Radio value="add">拼接</Radio>
            </RadioGroup>
            <CombinatorPlay
                // list={resList}
                onStart={async () => setCom(comMethod==='fix'?await startFix():await startAdd())}
                com={com}
                mediaType="audio"
            ></CombinatorPlay>
        </div>
        </>
    );
}