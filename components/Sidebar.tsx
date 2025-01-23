import VirtualizedList from "@/components/ui/list";
import { Button } from "@/components/ui/button";
import { LucideTrash } from "lucide-react";
import React from "react";
import { useCourseFilters } from "@/lib/store";
import Semester from "@/components/Semester";
import { AllTimeCourseInfo, SemesterGroupGradeInfo } from "@/lib/types";

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
  const { visibleMoeds, clearMoeds } = useCourseFilters();
  return (
    <section
      className={
        "max-h-full sm:min-h-full sm:h-full max-sm:min-h-fit sm:overflow-y-hidden overflow-x-hidden p-2 flex flex-col gap-2 sm:w-1/4 w-full min-w-[300px] rounded-lg bg-zinc-100 border"
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
                "flex flex-row gap-2 h-10 justify-between w-full items-center"
              }
            >
              <h2 className={"text-xl font-bold select-none"}>סינון מועדים</h2>
              <Button
                disabled={!Object.values(visibleMoeds).some((v) => v)}
                className={"bg-zinc-50 border"}
                variant={"secondary"}
                onClick={clearMoeds}
              >
                <LucideTrash className={"text-red-500"} size={14} /> נקה מועדים
              </Button>
            </header>

            <div className={"grow overflow-hidden"}>
              <div className={"flex flex-col gap-2 max-h-full overflow-auto"}>
                {Object.entries(currentCourseGrades ?? {})
                  .filter((o) => Object.values(o[1] ?? {}).length)
                  .map(([semester, data]) => {
                    return (
                      <Semester
                        key={semester}
                        semester={semester}
                        grades={data}
                        courseId={selectedCourse.id ?? ""}
                      />
                    );
                  })}
              </div>
            </div>
          </>
        )}
    </section>
  );
};

export default Sidebar;
