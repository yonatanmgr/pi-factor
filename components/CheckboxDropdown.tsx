"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface Props {
  label: string;
  items: { label: string; value: string; checked: Checked }[];
  onSelect: (label: string, checked: Checked) => void;
}

export function CheckboxDropdown({ label, items, onSelect }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu open={isOpen} modal={false} dir={"rtl"}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={"w-full"}
          variant="outline"
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
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
