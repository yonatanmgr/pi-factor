import { Button } from "@/components/ui/button";
import { LucideListFilter, LucideTrash } from "lucide-react";
import React, { useEffect } from "react";
import { useCourseFilters } from "@/lib/store";
import Semester from "@/components/Semester";
import { AllTimeCourseInfo, SemesterGroupGradeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {AnimatePresence} from "motion/react";

interface SidebarProps {
  selectedCourse: AllTimeCourseInfo | null;
  currentCourseGrades:
    | {
        [p: string]:
          | { [p: string]: SemesterGroupGradeInfo[] | undefined }
          | undefined;
      }
    | null
    | undefined;
}

const Sidebar = ({ selectedCourse, currentCourseGrades }: SidebarProps) => {
  const { visibleMoeds, clearMoeds, setVisibility } = useCourseFilters();

  useEffect(() => {
    if (selectedCourse?.id) {
      for (const semester of selectedCourse.semesters ?? []) {
        setVisibility("moed", semester + "0", true);
        setVisibility("group", semester + "00", true);
      }
    }
  }, [selectedCourse]);
  return (
    <section
      className={
        "max-h-full sm:min-h-full sm:h-full max-sm:min-h-fit min-w-1/4 sm:overflow-y-hidden overflow-x-hidden p-2 flex flex-col gap-2 sm:w-1/4 w-full min-w-[300px] rounded-lg bg-zinc-100 dark:bg-zinc-950 border"
      }
    >
      {selectedCourse &&
        Object.entries(currentCourseGrades ?? {}).some(
          (o) => Object.values(o[1] ?? {}).length,
        ) && (
          <>
            {/*<div className={"h-px w-full bg-zinc-300/50 my-2"}></div>*/}
            <header
              className={
                "flex flex-row gap-2  justify-between w-full items-center"
              }
            >
              <h2
                className={
                  "text-lg pr-1 font-bold select-none flex flex-row gap-2 items-center"
                }
              >
                <LucideListFilter
                  className={"text-zinc-500 dark:text-zinc-400"}
                  size={20}
                />
                סינון מועדים
              </h2>
              <Button
                triggerclassname={cn(
                  !Object.values(visibleMoeds).some((v) => v)
                    ? "cursor-default"
                    : "",
                )}
                disabled={!Object.values(visibleMoeds).some((v) => v)}
                className={"bg-zinc-50 dark:bg-zinc-900 border"}
                variant={"secondary"}
                onClick={(e) => {
                  clearMoeds();
                  e.stopPropagation();
                }}
              >
                <LucideTrash className={"text-red-500"} size={14} /> נקה מועדים
              </Button>
            </header>

            <div className={"grow overflow-hidden"}>
              <div className={"flex flex-col gap-2 max-h-full overflow-auto"}>
                <AnimatePresence mode={"popLayout"}>
                  {Object.entries(currentCourseGrades ?? {})
                    .filter((o) => Object.values(o[1] ?? {}).length)
                    .map(([semester, data]) => {
                      return (
                        <Semester
                          key={selectedCourse.id+semester}
                          semester={semester}
                          grades={data}
                          courseId={selectedCourse.id ?? ""}
                        />
                      );
                    })}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
    </section>
  );
};

export default Sidebar;
