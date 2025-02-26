import { LucideListFilter, LucideTrash } from "lucide-react";
import { TRANSLATIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { AnimatePresence } from "motion/react";
import Semester from "@/components/Semester";
import React, { useState } from "react";
import { AllTimeCourseInfo, SemesterGroupGradeInfo } from "@/lib/types";
import { useCourseFilters, useSettings } from "@/lib/store";
import { SemesterData } from "@/lib/hooks/useSemesterData";

interface ExamsListProps {
  selectedCourse: AllTimeCourseInfo | null;
  currentCourseGrades:
    | {
        [p: string]:
          | { [p: string]: SemesterGroupGradeInfo[] | undefined }
          | undefined;
      }
    | null
    | undefined;
  semesterDataResults: {
    semester: string;
    processedData: Omit<SemesterData, "isValidating">;
  }[];
}

const ExamsList = ({
  selectedCourse,
  currentCourseGrades,
  semesterDataResults,
}: ExamsListProps) => {
  const { visibleMoeds, clearMoeds } = useCourseFilters();
  const { language } = useSettings();
  const [search, setSearch] = useState("");

  const exams = Object.entries(currentCourseGrades ?? {}).filter(
    (o) => Object.values(o[1] ?? {}).length,
  );

  const matchingSemesters = exams.filter(([semester, data]) => {
    const semesterData = semesterDataResults.find(
      (res) => res.semester === semester,
    )?.processedData;
    if (!semesterData) {
      return false;
    }
    return search.split(" ").every((word) => {
      return `${semesterData.semesterName} ${semesterData.lecturersList}`
        .toLowerCase()
        .trim()
        .replace(" ", "")
        .replace(",", "")
        .includes(word.toLowerCase().trim());
    });
  });

  if (
    selectedCourse &&
    Object.entries(currentCourseGrades ?? {}).some(
      (o) => Object.values(o[1] ?? {}).length,
    )
  ) {
    return (
      <>
        <header
          className={"flex flex-row gap-2 justify-between w-full items-center"}
        >
          <h2
            className={
              "text-lg pr-1 font-bold select-none flex flex-row gap-2 items-center"
            }
          >
            <LucideListFilter
              className={"text-neutral-500 dark:text-neutral-400"}
              size={20}
            />
            {TRANSLATIONS[language].dates_filter}
          </h2>
          <Button
            triggerclassname={cn(
              !Object.values(visibleMoeds).some((v) => v)
                ? "cursor-default"
                : "",
            )}
            disabled={!Object.values(visibleMoeds).some((v) => v)}
            className={"bg-neutral-50 dark:bg-neutral-900 border"}
            variant={"outlined"}
            onClick={(e) => {
              clearMoeds(selectedCourse?.id ?? "");
              e.stopPropagation();
            }}
          >
            <LucideTrash className={"text-red-500"} size={14} />{" "}
            {TRANSLATIONS[language].clear_filters}
          </Button>
        </header>
        <input
          type="text"
          placeholder={TRANSLATIONS[language].search_exam}
          className="p-2 rounded-md border placeholder:text-sm border-neutral-200 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 focus:outline-hidden focus:dark:border-neutral-700 focus:border-neutral-300 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={"grow overflow-hidden"}>
          <div
            className={
              "flex flex-col gap-2 max-h-full overflow-auto rounded-md"
            }
          >
            <AnimatePresence mode={"popLayout"}>
              {matchingSemesters.length == 0 && (
                <div className="flex flex-row justify-center items-center p-2 rounded-md text-neutral-500 select-none">
                  {TRANSLATIONS[language].no_semesters_match}
                </div>
              )}
              {matchingSemesters.map(([semester, data]) => (
                <Semester
                  key={selectedCourse.id + semester}
                  semester={semester}
                  grades={data}
                  courseId={selectedCourse.id ?? ""}
                  searchQuery={search}
                  semesterData={
                    semesterDataResults.find((res) => res.semester === semester)
                      ?.processedData
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  }
  return <></>;
};

export default ExamsList;
