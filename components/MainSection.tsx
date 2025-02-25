import { Button } from "@/components/ui/button";
import { cn, dir, first } from "@/lib/utils/utils";
import {
  LucideChartColumnIncreasing,
  LucideChartColumnStacked,
  LucideListFilter,
} from "lucide-react";
import { GradeChart } from "@/components/Chart";
import React, { useState } from "react";
import {
  AllTimeCourseInfo,
  AllTimeGrades,
  SemesterGroupGradeInfo,
} from "@/lib/types";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useSettings } from "@/lib/store";
import { useWindowSize } from "usehooks-ts";
import { snapPoints, TRANSLATIONS } from "@/lib/constants";
import CourseSelectionHeader from "@/components/CourseSelectionHeader";
import { ibmPlexSansArabic, ibmPlexSansHebrew } from "@/lib/fonts";
import ExamsList from "@/components/ExamsList";
import useResetExams from "@/lib/hooks/useResetExams";
import TopLecturers from "@/components/TopLecturers";
import { SemesterData } from "@/lib/hooks/useSemesterData";

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
  semesterDataResults: {
    semester: string;
    processedData: Omit<SemesterData, "isValidating">;
  }[];
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
  semesterDataResults,
}: MainSectionProps) => {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const { language } = useSettings();

  useResetExams(selectedCourse);

  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const [view, setView] = useState<"stacked" | "grouped">("stacked");

  return (
    <section
      className={
        "sm:min-h-full max-sm:grow h-fit overflow-hidden flex flex-col gap-2 sm:p-2 sm:h-full w-full sm:rounded-xl sm:bg-neutral-100 sm:dark:bg-neutral-900/30 sm:dark:border-neutral-500/20 sm:border"
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
          "grow rounded-md w-full sm:bg-linear-to-t from-neutral-50/30 to-neutral-50 dark:from-neutral-900/30 dark:to-neutral-900 sm:border overflow-hidden"
        }
      >
        {!selectedCourses?.length && (
          <div
            className={
              "w-full h-full text-lg px-10 text-center text-neutral-400 select-none flex flex-row items-center justify-center"
            }
          >
            {TRANSLATIONS[language].select_courses}
          </div>
        )}
        {selectedCourses.length > 0 && selectedTab < 0 && (
          <div
            className={
              "w-full h-full text-lg px-10 text-center text-neutral-400 select-none flex flex-row items-center justify-center"
            }
          >
            {TRANSLATIONS[language].chart_placeholder}
          </div>
        )}
        {selectedCourses.length > 0 && selectedTab > -1 && selectedCourse && (
          <div
            dir={dir(language)}
            className={
              "sm:px-4 sm:py-3 h-full flex flex-col relative gap-1 max-h-full"
            }
          >
            <Button
              variant={"ghost"}
              onClick={() =>
                setView(view === "stacked" ? "grouped" : "stacked")
              }
              className={
                "absolute top-2 bg-neutral-50 dark:bg-neutral-900 shadow-none max-sm:hidden rtl:left-2 ltr:right-2"
              }
            >
              {
                {
                  grouped: (
                    <>
                      <LucideChartColumnStacked size={14} />
                      {TRANSLATIONS[language].show_in_stacked}
                    </>
                  ),
                  stacked: (
                    <>
                      <LucideChartColumnIncreasing size={14} />
                      {TRANSLATIONS[language].show_in_grouped}
                    </>
                  ),
                }[view]
              }
            </Button>
            <a
              target={"_blank"}
              rel={"noreferrer"}
              href={`https://www.ims.tau.ac.il/Tal/Syllabus/Syllabus_L.aspx?course=${selectedCourse.id}01&year=${parseInt(first(selectedCourse.semesters)?.slice(0, 4) ?? "") - 1}`}
              className={
                "flex flex-row gap-2 sm:mb-1 text-2xl hover:underline w-fit overflow-y-hidden min-h-[20px]"
              }
            >
              {selectedCourse?.name && (
                <span
                  className={cn(
                    "font-bold max-sm:text-lg flex flex-row gap-2 min-h-[20px]",
                    ibmPlexSansHebrew.className,
                  )}
                >
                  <span className={"min-w-fit"}>{selectedCourse?.name}</span>
                  {selectedCourse?.id && (
                    <span className={"font-light inline-block min-w-fit"}>
                      | {selectedCourse?.id}
                    </span>
                  )}
                </span>
              )}
            </a>
            <span className={"opacity-80 max-sm:mt-1 max-sm:text-sm"}>
              {TRANSLATIONS[language].faculty}:{" "}
              <span className={cn("font-bold", ibmPlexSansHebrew.className)}>
                {selectedCourse?.faculty}
              </span>
            </span>

            <div className="w-full h-px bg-neutral-300/50 dark:bg-neutral-500/40 my-2"></div>

            <TopLecturers
              semesterDataResults={semesterDataResults}
              language={language}
            />

            <div className={"grow h-full mt-2 w-full overflow-auto"}>
              <GradeChart
                view={view}
                data={currentCourseGrades}
                courseId={selectedCourse.id ?? ""}
              />
            </div>
            {isMobile && (
              <section
                className={
                  "flex flex-row mt-2 gap-2 items-center w-full justify-between"
                }
              >
                <Drawer
                  snapPoints={snapPoints as (number | string)[]}
                  activeSnapPoint={snap}
                  setActiveSnapPoint={setSnap}
                  fadeFromIndex={0}
                >
                  <DrawerTrigger asChild>
                    <Button className={"w-full"} disabled={isLoading}>
                      <LucideListFilter
                        className={"text-neutral-300 dark:text-neutral-600"}
                        size={14}
                      />
                      {TRANSLATIONS[language].dates_filter}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent
                    className={cn(
                      "fixed flex flex-col bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]",
                      language === "ar" && ibmPlexSansArabic.className,
                    )}
                    dir={dir(language)}
                  >
                    <div className="flex flex-col max-w-md mx-auto gap-4 w-full p-4 pt-5 overflow-y-auto">
                      <ExamsList
                        selectedCourse={selectedCourse}
                        currentCourseGrades={currentCourseGrades}
                        semesterDataResults={semesterDataResults}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
                <Button
                  onClick={() =>
                    setView(view === "stacked" ? "grouped" : "stacked")
                  }
                  className={"w-full"}
                >
                  {
                    {
                      grouped: (
                        <>
                          <LucideChartColumnStacked
                            size={14}
                            className="text-neutral-300 dark:text-neutral-600"
                          />
                          {TRANSLATIONS[language].show_in_stacked}
                        </>
                      ),
                      stacked: (
                        <>
                          <LucideChartColumnIncreasing
                            size={14}
                            className="text-neutral-300 dark:text-neutral-600"
                          />
                          {TRANSLATIONS[language].show_in_grouped}
                        </>
                      ),
                    }[view]
                  }
                </Button>
              </section>
            )}
          </div>
        )}
      </section>
    </section>
  );
};

export default MainSection;
