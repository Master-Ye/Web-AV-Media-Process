import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import SideBar from "../components/sideBar.tsx";

const Synthesis = () => {
  const location = useLocation();

  const decodingSubMenu = [
    {
      path: 'video-cut',
      name: '视频剪辑'
    },
    {
      path: 'split-track',
      name: '轨道分离'
    },
    {
      path: 'small-pic',
      name: '缩略图'
    },
  ];

  return (
    <div className="flex">
      {/* 左侧功能导航 */}
      <div className="w-64 bg-[#ecf0f1] p-4 pt-8">
        <h2 className="text-xl font-bold text-[#2c3e50] mb-4">音视频剪辑</h2>
        <SideBar menus={decodingSubMenu}></SideBar>
      </div>

      {/* 主工作区 */}
      <div className="flex-1 p-6 bg-[#f7f9fa]">
        <Outlet />
      </div>
    </div>
  );
};

export default Synthesis