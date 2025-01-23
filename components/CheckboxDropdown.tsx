"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface Props {
  label: string;
    icon?: React.ReactNode;
  items: { label: string; value: string; checked: Checked }[];
  onSelect: (label: string, checked: Checked) => void;
}

export const useViewport = () => {
    const [width, setWidth] = React.useState(window.innerWidth);
    const [height, setHeight] = React.useState(window.innerHeight);

    React.useEffect(() => {
        const handleWindowResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);

    const isMobile = width < 640;

    return { width, height, isMobile };
}

export function CheckboxDropdown({ label, icon, items, onSelect }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useViewport().isMobile;


  return (
    <DropdownMenu open={isOpen} modal={false} dir={"rtl"}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => !isMobile && setIsOpen(false)}
          className={"w-full flex flex-row gap-2 items-center"}
          variant="outline"
        >
            {
                icon ? icon : null
            }
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
        className="w-full -mt-1 rounded-t-none border-t-0"
      >
        {/*<DropdownMenuLabel></DropdownMenuLabel>*/}
        {items.map((item, index) => (
          <React.Fragment key={"fragment"+index}>
            {index !== 1 ? null : <DropdownMenuSeparator />}
            <DropdownMenuCheckboxItem
              key={index}
              checked={item.checked}
              onCheckedChange={(checked) => {
                setIsOpen(true);
                onSelect(item.value, checked);
              }}
            >
              {item.label}
            </DropdownMenuCheckboxItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
