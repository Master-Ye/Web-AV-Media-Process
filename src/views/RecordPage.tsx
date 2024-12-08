import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import SideBar from "../components/sideBar.tsx";

const RedcordPage = () => {
    const location = useLocation();

    const decodingSubMenu = [
      {
        path: 'live-record',
        name: '直播录制'
      },
      {
        path: 'photo',
        name: '摄像头'
      },
    ];

    return (
      <div className="flex">
        {/* 左侧功能导航 */}
        <div className="w-64 bg-[#ecf0f1] p-4 pt-8">
          <h2 className="text-xl font-bold text-[#2c3e50] mb-4">视频录制</h2>
          <SideBar menus={decodingSubMenu}></SideBar>
        </div>

        {/* 主工作区 */}
        <div className="flex-1 p-6 bg-[#f7f9fa]">
          <Outlet />
        </div>
      </div>
    );
  };

export default RedcordPage