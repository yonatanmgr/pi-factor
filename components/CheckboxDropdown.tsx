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
import {useSettings} from "@/lib/store";
import {dir} from "@/lib/utils";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface Props {
  label: string;
  icon?: React.ReactNode;
  items: { label: string; value: string; checked: Checked }[];
  onSelect: (label: string, checked: Checked) => void;
}

export function CheckboxDropdown({ label, icon, items, onSelect }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const {language} = useSettings();

  return (
    <DropdownMenu open={isOpen} modal={true} dir={dir(language)}>
      <DropdownMenuTrigger asChild>
        <Button
          triggerclassname={"w-full"}
          onClick={() => setIsOpen(!isOpen)}
          className={"w-full flex flex-row gap-2 items-center"}
          variant="outlined"
        >
          {icon ? icon : null}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onInteractOutside={() => setIsOpen(false)}
        className="w-full"
      >
        {/*<DropdownMenuLabel></DropdownMenuLabel>*/}
        {items.map((item, index) => (
          <React.Fragment key={"fragment" + index}>
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
