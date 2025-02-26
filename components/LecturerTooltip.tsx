import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, dir, getSemesterName } from "@/lib/utils/utils";
import { TRANSLATIONS } from "@/lib/constants";
import { Language } from "@/lib/types";

interface LecturerTooltipProps {
  lecturer: string;
  average: number;
  semesters: string[];
  language: Language;
  children: React.ReactNode;
  className?: string;
}

const LecturerTooltip: React.FC<LecturerTooltipProps> = ({
  lecturer,
  average,
  semesters,
  language,
  children,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <div
            className={className}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onTouchStart={() => setOpen(true)}
            onTouchEnd={() => setOpen(false)}
            onKeyDown={(e) => {
              e.preventDefault();
              e.key === "Enter" && setOpen(!open);
            }}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          dir={dir(language)}
          className="max-w-[200px] overflow-hidden"
        >
          <div className={"font-bold mb-1"}>
            {TRANSLATIONS[language].taught_in_semesters}:
          </div>
          <div className="text-xs flex flex-wrap gap-1">
            {semesters.toReversed().map((s, index) => (
              <span key={index}>
                {getSemesterName(s, language)}
                {index !== semesters.length - 1 && ", "}
              </span>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LecturerTooltip;
