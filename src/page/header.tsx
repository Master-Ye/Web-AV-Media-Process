import React from "react"
import { FileText, Film, Mic, Scissors, ChevronDown } from 'lucide-react';
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
  <Navbar className="bg-blue"
      isBordered isBlurred={false} shouldHideOnScroll>
      <NavbarContent className="sm:flex gap-1" justify="start">
        <p className="font-bold text-inherit">MediaCore</p>
      </NavbarContent>
      <NavbarContent className="sm:flex gap-1" justify="start">
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
        <NavbarItem className="lg:flex">
          <a href="#">作者博客</a>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
    </>
}





export default Header