import { cn, Listbox, ListboxItem } from "@nextui-org/react";
import { AddNoteIcon, CopyDocumentIcon, DeleteDocumentIcon, EditDocumentIcon, ListboxWrapper } from "./svgs.tsx";
import React from "react";
import { Link } from "react-router-dom";


const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0"


const SideBar = (props) => {

    let menus = props.menus

    console.log(menus)
    return <ListboxWrapper>
        <Listbox aria-label="Listbox menu with icons" variant="faded">
            {menus.map((item) =>
                <ListboxItem key={item.path}
                    className="text-danger"
                    color="danger"
                    startContent={<DeleteDocumentIcon className={cn(iconClasses, "text-danger")} />}>
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
                  py-2 px-3 text-[#34495e]
                  hover:bg-white rounded
                  block
                `}
                    >
                        {item.name}
                    </Link>
                </ListboxItem>
            )}
        </Listbox>
    </ListboxWrapper>
}

export default SideBar