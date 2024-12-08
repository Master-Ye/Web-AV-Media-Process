import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import SideBar from "../components/sideBar.tsx";

const DecodePage = () => {
    const location = useLocation();

    const decodingSubMenu = [
      {
        path: 'pic',
        name: '图片抠图'
      },
    //   {
    //     path: 'audio-pro',
    //     name: '音频解析'
    //   },
    //   {
    //     path: 'video-pro',
    //     name: '视频解析'
    //   },
    //   {
    //     path: 'audio-decode',
    //     name: '音频解码'
    //   }
    ];

    return (
      <div className="flex">
        {/* 左侧功能导航 */}
        <div className="w-64 bg-[#ecf0f1] p-4 pt-8">
          <h2 className="text-xl font-bold text-[#2c3e50] mb-4">音视频解码</h2>
          <SideBar menus={decodingSubMenu}></SideBar>
        </div>

        {/* 主工作区 */}
        <div className=" p-6 bg-[#f7f9fa]">
          <Outlet />
        </div>
      </div>
    );
  };

export default DecodePage