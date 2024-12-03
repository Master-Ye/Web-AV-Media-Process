import React from "react"
import { FileText, Film, Mic, Scissors, ChevronDown } from 'lucide-react';
// 菜单项
const menuItems = [
    { name: '音视频解码', icon: FileText },
    { name: '音视频合成', icon: Film },
    { name: '音视频录制', icon: Mic },
    { name: '抠图特效', icon: Scissors }
  ];
const Header = ()=>{
  return <div className="flex h-screen bg-gray-400">
    {/* 顶部导航栏 */}
    <div className="fixed top-0 left-0 right-0 bg-gray-400 flex items-center p-4 z-10">
      <h1 className="text-2xl font-bold mr-8">MediaCore</h1>
      {menuItems.map((item) => (
        <div
          key={item.name}
          className="flex items-center mx-4 cursor-pointer hover:text-blue-300"
        >
          <item.icon className="mr-2" size={18} />
          {item.name}
        </div>
      ))}
    </div>
    </div>
}





export default   Header