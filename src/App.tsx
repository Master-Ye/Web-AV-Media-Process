
import './App.css';
import React from 'react';
import VideoPro from './page/videoPro.tsx';
import { NextUIProvider } from "@nextui-org/react"
function App() {
  return (
    <div className="App">
      <NextUIProvider>
        <VideoPro></VideoPro>
      </NextUIProvider>
    </div>
  );
}

export default App;
