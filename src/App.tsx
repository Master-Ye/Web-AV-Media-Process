
import './App.css';
import React from 'react';
import VideoPro from './page/videoPro.tsx';
import { NextUIProvider } from "@nextui-org/react"
import AudioPro from './page/audioPro.tsx';
import AllPro from './page/allPro.tsx';
import Header from './page/header.tsx';
import SmallPic from './page/smallPic.tsx';
import SplitTrack from './page/splitTrack.tsx';
import {
  Routes,
  Route,
  Link,
  Outlet,
  useLocation
} from 'react-router-dom';
import VideoCut from './page/videoCut.tsx';


function App() {
  return (
    <div className="App">
      <NextUIProvider>
        <Header/>
        {/* <VideoPro></VideoPro>
        <AudioPro></AudioPro>
        <AllPro></AllPro> */}
        {/* <SmallPic></SmallPic> */}
        {/* <SplitTrack></SplitTrack> */}
        <VideoCut></VideoCut>
      </NextUIProvider>
    </div>
  );
}

export default App;
