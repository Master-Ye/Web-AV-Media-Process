import React from "react"
import { FileText, Film, Mic, Scissors } from 'lucide-react';
import { Link } from "react-router-dom";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
// 菜单项
const menuItems = [
  { name: '音视频解码', icon: FileText, path: 'decode' },
  { name: '音视频合成', icon: Film, path: 'synthesis' },
  { name: '音视频录制', icon: Mic, path: 'record' },
  { name: '抠图特效', icon: Scissors, path: 'chroma-key' }
];
const Header = () => {
  return  <>
  <Navbar className="bg-[#2c3e50] text-white"
      isBordered isBlurred={false} shouldHideOnScroll>
      <NavbarContent className=" gap-8 " justify="start">
        <span className="font-bold text-inherit text-2xl">MediaProcess</span>
      </NavbarContent>
      <NavbarContent className="sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem>
            <Link
              to={(item.path)}
              key={item.name}
              className="flex items-center mx-4 cursor-pointer hover:text-blue-300"
            >
              <item.icon className="mr-2" size={30} />
              {item.name}
            </Link>
          </NavbarItem>
        ))}

      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="">
          <a href="https://blog.master-ye.top/" target="_blank">作者博客</a>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
    </>
}





export default Header