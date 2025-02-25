import React from "react";
import { cn } from "@/lib/utils/utils";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import LecturerTooltip from "./LecturerTooltip";
import { Language } from "@/lib/types";

interface LecturerItemProps {
  lecturer: string;
  average: number;
  semesters: string[];
  language: Language;
  index: number;
}

const LecturerItem: React.FC<LecturerItemProps> = ({
  lecturer,
  average,
  semesters,
  language,
  index,
}) => {
  return (
    <LecturerTooltip
      lecturer={lecturer}
      average={average}
      semesters={semesters}
      language={language}
      className={cn(
        "flex items-center select-none min-w-fit gap-2 px-2 py-1.5 rounded-md text-sm cursor-default",
        index === 0 ? "font-bold" : "",
      )}
    >
      <span className={cn(ibmPlexSansHebrew.className)}>
        {index + 1}. {lecturer}
      </span>
      <span className="text-neutral-500 min-w-fit dark:text-neutral-400 font-mono">
        {average.toFixed(2)}
      </span>
    </LecturerTooltip>
  );
};

export default LecturerItem;
