import React from "react"
import Header from "./page/header.tsx"
import { Outlet } from "react-router-dom"
import { Card, CardBody, CardFooter, CardHeader, Divider, Link } from "@nextui-org/react"

{/* <Header/> */ }
const Layout = () => {


    return <>
        <Header />
        <div className="justify-center flex">
        <Card className="w-[1450px] justify-center mt-8">
            {/* <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                    <p className="text-md">NextUI</p>
                    <p className="text-small text-default-500">nextui.org</p>
                </div>
            </CardHeader>
            <Divider /> */}
            <CardBody>
                <Outlet></Outlet>
            </CardBody>
            <Divider />
            {/* <CardFooter>
                <Link isExternal showAnchorIcon href="https://github.com/nextui-org/nextui">
                    Visit source code on GitHub.
                </Link>
            </CardFooter> */}

        </Card>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-[#2c3e50] text-[#bdc3c7] p-3 text-center">
            © 2024 MediaProcess - Web专业音视频底层处理工具
        </div>
    </>
}

export default Layout