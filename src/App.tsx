
import './App.css';
import React from 'react';
import VideoPro from './page/videoPro.tsx';
import { NextUIProvider } from "@nextui-org/react"
import AudioPro from './page/audioPro.tsx';
import AllPro from './page/allPro.tsx';
import SmallPic from './page/smallPic.tsx';
import SplitTrack from './page/splitTrack.tsx';
import {
  Routes,
  Route,
  BrowserRouter as Router,
} from 'react-router-dom';
import VideoCut from './page/videoCut.tsx';
import Layout from './layout.tsx';
import IndexPage from './views/IndexPage.tsx';
import NotFound from './views/notFound.tsx';
import DecodePage from './views/DecodePage.tsx';
import Synthesis from './views/Synthesis.tsx';
import RecordPage from './views/RecordPage.tsx';
import LiveRecord from './page/liveRecord.tsx';
import Photo from './page/photo.tsx';
import Chromakey from './page/chromakey.tsx';
import ChromakeyPage from './views/ChromakeyPage.tsx';


function App() {
  return (
    <div className="App">
      <NextUIProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<IndexPage />} />
              <Route path="decode" element={<DecodePage />} >
                <Route index element={<AllPro />} />

                {/* 嵌套子路由 */}
                {/* {/* <Route path="format-analysis" element={<FormatAnalysis />} />
        <Route path="stream-parsing" element={<StreamParsing />} /> */}
                <Route path="all-pro" element={<AllPro />} />
                <Route path="video-pro" element={<VideoPro />} />
                <Route path="audio-pro" element={<AudioPro />} />
              </Route>
              <Route path="synthesis" element={<Synthesis />}>
                <Route index element={<VideoCut />} />
                <Route path="video-cut" element={<VideoCut />} />
                <Route path="split-track" element={<SplitTrack />} />
                <Route path="small-pic" element={<SmallPic />} />
              </Route>
              <Route path="record" element={<RecordPage />} >
                <Route index element={<LiveRecord />} />
                <Route path="live-record" element={<LiveRecord />} />
                <Route path="photo" element={<Photo />} />
                <Route />
              </Route>
              <Route path="chroma-key" element={<ChromakeyPage />} >
              <Route index element={<Chromakey />} />
              <Route path="pic" element={<Chromakey />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </NextUIProvider>
    </div>
  );
}

export default App;
