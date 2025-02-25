import React from "react";
import { cn } from "@/lib/utils/utils";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import { TRANSLATIONS } from "@/lib/constants";
import { LucideCrown, LucideUserMinus, LucideUserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LecturerItem from "./LecturerItem";
import { Language } from "@/lib/types";

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

  const [showAll, setShowAll] = React.useState(false);

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
    .sort((a, b) => b.average - a.average);

  if (sortedLecturers.length === 0) return null;

  return (
    <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center gap-2 py-2 px-4 bg-neutral-200/60 dark:bg-neutral-800/50 rounded-md sm:rounded-lg">
      <h3
        className={cn(
          "text-sm flex flex-row gap-1.5 items-center select-none min-w-fit text-neutral-600 dark:text-neutral-400",
          ibmPlexSansHebrew.className,
        )}
      >
        <LucideCrown size={14} /> {TRANSLATIONS[language].top_lecturers}:
      </h3>
      <div className="flex gap-2">
        {sortedLecturers
          .slice(0, showAll ? sortedLecturers.length : 5)
          .map(({ lecturer, average, semesters }, index) => (
            <LecturerItem
              key={lecturer}
              lecturer={lecturer}
              average={average}
              semesters={semesters}
              language={language}
              index={index}
            />
          ))}

        {sortedLecturers.length > 5 && (
          <Button
            className={"text-sm min-w-fit select-none"}
            onClick={() => setShowAll((prev) => !prev)}
            variant={"outlined"}
            size={"sm"}
          >
            {showAll ? (
              <LucideUserMinus size={14} />
            ) : (
              <LucideUserPlus size={14} />
            )}
            {showAll
              ? TRANSLATIONS[language].show_less
              : TRANSLATIONS[language].show_all}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopLecturers;
