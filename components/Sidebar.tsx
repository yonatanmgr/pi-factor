import React, { useEffect } from "react";
import { useCourseFilters } from "@/lib/store";
import { AllTimeCourseInfo, SemesterGroupGradeInfo } from "@/lib/types";
import ExamsList from "@/components/ExamsList";

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
  const { setVisibility } = useCourseFilters();

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
        "max-h-full sm:min-h-full sm:h-full max-sm:min-h-fit min-w-1/4 sm:overflow-y-hidden overflow-x-hidden p-2 flex flex-col gap-2 sm:w-1/4 w-full min-w-[300px] rounded-xl bg-zinc-100 dark:bg-zinc-900/30 dark:border-zinc-500/20 border"
      }
    >
      <ExamsList
        selectedCourse={selectedCourse}
        currentCourseGrades={currentCourseGrades}
      />
    </section>
  );
};

export default Sidebar;
