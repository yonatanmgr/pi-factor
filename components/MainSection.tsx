import { Button } from "@/components/ui/button";
import { cn, dir, first } from "@/lib/utils";
import { LucideListFilter } from "lucide-react";
import { GradeChart } from "@/components/Chart";
import React, { useEffect, useState } from "react";
import {
  AllTimeCourseInfo,
  AllTimeGrades,
  SemesterGroupGradeInfo,
} from "@/lib/types";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useCourseFilters, useSettings } from "@/lib/store";
import { useWindowSize } from "usehooks-ts";
import {
  courseListSnapPoints,
  snapPoints,
  TRANSLATIONS,
} from "@/lib/constants";
import CourseSelectionHeader from "@/components/CourseSelectionHeader";
import { ibmPlexSansArabic, ibmPlexSansHebrew } from "@/lib/fonts";
import ExamsList from "@/components/ExamsList";

interface MainSectionProps {
  selectedCourses: AllTimeCourseInfo[];
  setSelectedCourses: (courses: AllTimeCourseInfo[]) => void;
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
  grades: AllTimeGrades | undefined;
  selectedCourse: AllTimeCourseInfo | null;
  currentCourseGrades:
    | {
        [p: string]:
          | { [p: string]: SemesterGroupGradeInfo[] | undefined }
          | undefined;
      }
    | null
    | undefined;
  options: { [id: string]: AllTimeCourseInfo & { id: string } };
  isLoading: boolean;
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
}

export type snapPoint = number | string | null;

const MainSection = ({
  selectedCourses,
  setSelectedCourses,
  selectedTab,
  setSelectedTab,
  grades,
  selectedCourse,
  currentCourseGrades,
  options,
  isLoading,
  onSelectedOptions,
}: MainSectionProps) => {
  const {setVisibility } = useCourseFilters();
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const { language } = useSettings();

  useEffect(() => {
    if (selectedCourse?.id) {
      for (const semester of selectedCourse.semesters ?? []) {
        setVisibility("moed", semester + "0", true);
        setVisibility("group", semester + "00", true);
      }
    }
  }, [selectedCourse]);

  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  return (
    <section
      className={
        "sm:min-h-full max-sm:grow h-fit overflow-hidden flex flex-col gap-2 p-2 sm:h-full w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/30 dark:border-zinc-500/20 border"
      }
    >
      <CourseSelectionHeader
        isMobile={isMobile}
        isLoading={isLoading}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        options={options}
        onSelectedOptions={onSelectedOptions}
        grades={grades}
      />
      <section
        className={
          "grow rounded-md w-full bg-zinc-50 dark:bg-zinc-900 border overflow-hidden"
        }
      >
        {!selectedCourses?.length && (
          <div
            className={
              "w-full h-full text-lg px-10 text-center text-zinc-400 select-none flex flex-row items-center justify-center"
            }
          >
            {TRANSLATIONS[language].select_courses}
          </div>
        )}
        {selectedCourses.length > 0 && selectedTab < 0 && (
          <div
            className={
              "w-full h-full text-lg px-10 text-center text-zinc-400 select-none flex flex-row items-center justify-center"
            }
          >
            {TRANSLATIONS[language].chart_placeholder}
          </div>
        )}
        {selectedCourses.length > 0 && selectedTab > -1 && selectedCourse && (
          <div
            dir={dir(language)}
            className={"px-4 py-3 h-full flex flex-col gap-2 max-h-full"}
          >
            <a
              target={"_blank"}
              rel={"noreferrer"}
              href={`https://www.ims.tau.ac.il/Tal/Syllabus/Syllabus_L.aspx?course=${selectedCourse.id}01&year=${parseInt(first(selectedCourse.semesters)?.slice(0, 4) ?? "") - 1}`}
              className={
                "flex flex-row flex-wrap gap-2 text-2xl hover:underline w-fit"
              }
            >
              {selectedCourse?.name && (
                <span className={cn("font-bold", ibmPlexSansHebrew.className)}>
                  {selectedCourse?.name}
                  {selectedCourse?.id && (
                    <span className={"font-light"}>
                      {" "}
                      | {selectedCourse?.id}
                    </span>
                  )}
                </span>
              )}
            </a>
            <span className={"opacity-80"}>
              {TRANSLATIONS[language].faculty}:{" "}
              <span className={cn("font-bold", ibmPlexSansHebrew.className)}>
                {selectedCourse?.faculty}
              </span>
            </span>
            <div
              className={"w-full h-px bg-zinc-300/50 dark:bg-zinc-500/40 my-2"}
            ></div>
            <div className={"grow h-full w-full overflow-auto"}>
              <GradeChart data={currentCourseGrades} />
            </div>
            {isMobile && (
              <Drawer
                snapPoints={snapPoints as (number | string)[]}
                activeSnapPoint={snap}
                setActiveSnapPoint={setSnap}
                fadeFromIndex={0}
              >
                <DrawerTrigger asChild>
                  <Button className={"w-full"} disabled={isLoading}>
                    <LucideListFilter
                      className={"text-zinc-300 dark:text-zinc-400"}
                      size={14}
                    />
                    {TRANSLATIONS[language].dates_filter}
                  </Button>
                </DrawerTrigger>
                <DrawerContent
                  className={cn(
                    "fixed flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]",
                    language === "ar" && ibmPlexSansArabic.className,
                  )}
                  dir={dir(language)}
                >
                  <div
                    className={cn(
                      "flex flex-col max-w-md mx-auto gap-4 w-full p-4 pt-5",
                      {
                        "overflow-y-auto": snap === 1,
                        "overflow-hidden": snap !== 1,
                      },
                    )}
                  >
                    <ExamsList
                      selectedCourse={selectedCourse}
                      currentCourseGrades={currentCourseGrades}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        )}
      </section>
    </section>
  );
};

export default MainSection;
