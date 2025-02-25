import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TRANSLATIONS } from "@/lib/constants";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import { Language } from "@/lib/types";
import { cn, dir, getSemesterName } from "@/lib/utils/utils";
import { LucideCrown } from "lucide-react";
import React from "react";

interface TopLecturersProps {
  semesterDataResults: Array<{
    semester: string;
    processedData: {
      lecturers: Set<string>;
      averageMean: number;
    };
  }>;
  language: Language;
}

const TopLecturers: React.FC<TopLecturersProps> = ({
  semesterDataResults,
  language,
}) => {
  const lecturerData = new Map<
    string,
    {
      total: number;
      count: number;
      semesters: Set<string>;
    }
  >();

  semesterDataResults.forEach(({ semester, processedData }) => {
    processedData.lecturers.forEach((lecturer) => {
      if (!lecturer) return;

      if (
        isNaN(processedData.averageMean) ||
        processedData.averageMean === undefined
      )
        return;

      const current = lecturerData.get(lecturer) || {
        total: 0,
        count: 0,
        semesters: new Set<string>(),
      };

      lecturerData.set(lecturer, {
        total: current.total + processedData.averageMean,
        count: current.count + 1,
        semesters: current.semesters.add(semester),
      });
    });
  });

  const sortedLecturers = Array.from(lecturerData.entries())
    .map(([lecturer, { total, count, semesters }]) => ({
      lecturer,
      average: count > 0 ? total / count : 0,
      semesters: Array.from(semesters).sort(),
    }))
    .filter(({ average }) => !isNaN(average) && average > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);

  if (sortedLecturers.length === 0) return null;

  return (
    <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center gap-2 py-2 px-4 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-lg">
      <h3
        className={cn(
          "text-sm flex flex-row gap-1.5 items-center select-none min-w-fit text-neutral-600 dark:text-neutral-400",
          ibmPlexSansHebrew.className,
        )}
      >
        <LucideCrown size={14} /> {TRANSLATIONS[language].top_lecturers}:
      </h3>
      <div className="flex gap-2">
        <TooltipProvider delayDuration={100}>
          {sortedLecturers.map(({ lecturer, average, semesters }, index) => (
            <Tooltip key={lecturer}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center min-w-fit gap-2 px-2 py-1.5 rounded-md text-sm cursor-default",
                    index === 0 ? "font-bold" : "",
                  )}
                >
                  <span className={cn(ibmPlexSansHebrew.className)}>
                    {index + 1}. {lecturer}
                  </span>
                  <span className="text-neutral-500 min-w-fit dark:text-neutral-400 font-mono">
                    {average.toFixed(2)}
                  </span>
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
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TopLecturers;
