import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LucideBookPlus, LucideX } from "lucide-react";
import { cn, dir } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AllTimeCourseInfo, AllTimeGrades } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { snapPoint } from "@/components/MainSection";
import CourseList from "@/components/CourseList";
import { courseListSnapPoints, TRANSLATIONS } from "@/lib/constants";
import { useSettings } from "@/lib/store";
import { ibmPlexSansArabic } from "@/lib/fonts";

interface CourseSelectionHeaderProps {
  isMobile: boolean;
  isLoading: boolean;
  selectedCourses: AllTimeCourseInfo[];
  setSelectedCourses: (courses: AllTimeCourseInfo[]) => void;
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
  options: { [id: string]: AllTimeCourseInfo & { id: string } };
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
  courseListSnap: snapPoint;
  setCourseListSnap: (snap: snapPoint) => void;
  grades: AllTimeGrades | undefined;
}

const CourseSelectionHeader = ({
  isMobile,
  isLoading,
  selectedCourses,
  setSelectedCourses,
  selectedTab,
  setSelectedTab,
  options,
  onSelectedOptions,
  courseListSnap,
  setCourseListSnap,
  grades,
}: CourseSelectionHeaderProps) => {
  const { language } = useSettings();

  return (
    <header
      className={
        "flex flex-row gap-2 overflow-x-auto overflow-y-hidden min-h-fit"
      }
    >
      {isMobile ? (
        <Drawer
          snapPoints={courseListSnapPoints as (number | string)[]}
          activeSnapPoint={courseListSnap}
          setActiveSnapPoint={setCourseListSnap}
          fadeFromIndex={0}
        >
          <DrawerTrigger asChild>
            <Button
              // className={"bg-zinc-50 dark:bg-zinc-900 border"}
              variant={"outlined"}
              disabled={isLoading}
            >
              <LucideBookPlus
                className={"text-zinc-500 dark:text-zinc-400"}
                size={14}
              />
              {TRANSLATIONS[language].edit_courses}
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
                "flex flex-col max-w-md mx-auto gap-4 h-full w-full p-4 pt-5",
                {
                  "overflow-y-auto": courseListSnap === 1,
                  "overflow-hidden": courseListSnap !== 1,
                },
              )}
            >
              <CourseList
                {...{
                  selectedCourses,
                  setSelectedCourses,
                  onSelectedOptions,
                  setSelectedTab,
                  options,
                  isLoading,
                  snapPoint: courseListSnap === 1 ? 1 : 0,
                }}
              />
              <DrawerFooter className="pt-1"></DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"outlined"} disabled={isLoading}>
              <LucideBookPlus
                className={"text-zinc-500 dark:text-zinc-400"}
                size={14}
              />
              {TRANSLATIONS[language].edit_courses}
            </Button>
          </DialogTrigger>
          <DialogContent className={cn("min-w-[300px]", language === "ar" && ibmPlexSansArabic.className,)} dir={dir(language)}>
            <DialogTitle>
              <span className={"text-xl font-bold select-none"}>
                {TRANSLATIONS[language].edit_courses}
                {selectedCourses?.length > 0 && (
                  <span className={"text-zinc-500 dark:text-zinc-400"}>
                    {" "}
                    ({selectedCourses.length})
                  </span>
                )}
              </span>
            </DialogTitle>
            <CourseList
              {...{
                selectedCourses,
                setSelectedCourses,
                onSelectedOptions,
                setSelectedTab,
                options,
                isLoading,
                snapPoint: courseListSnap === 1 ? 1 : 0,
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      {!selectedCourses?.length && (
        <span
          className={
            "w-full text-sm h-9 mr-1 text-zinc-500 dark:text-zinc-400 select-none flex flex-row items-center"
          }
        >
          {TRANSLATIONS[language].selected_courses_will_appear_here}
        </span>
      )}
      {selectedCourses?.map((course) => (
        <SelectedCourseButton
          key={course?.name}
          course={course}
          grades={grades}
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      ))}
    </header>
  );
};

interface SelectedCourseButtonProps {
  course: AllTimeCourseInfo;
  grades: AllTimeGrades | undefined;
  selectedCourses: AllTimeCourseInfo[];
  setSelectedCourses: (courses: AllTimeCourseInfo[]) => void;
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
}

const SelectedCourseButton = ({
  course,
  grades,
  selectedCourses,
  setSelectedCourses,
  selectedTab,
  setSelectedTab,
}: SelectedCourseButtonProps) => {
  const { language } = useSettings();

  return (
    <Button
      tooltipproviderprops={{ delayDuration: 300 }}
      tooltip={
        grades?.[course.id ?? ""] === undefined ||
        !grades?.[course.id ?? ""] ? (
          <span>{TRANSLATIONS[language].no_grade_data}</span>
        ) : null
      }
      className={cn(
        (grades?.[course.id ?? ""] === undefined ||
          !grades?.[course.id ?? ""]) &&
          "opacity-50 cursor-help",
      )}
      variant={
        selectedTab !== null && selectedTab == selectedCourses.indexOf(course)
          ? "default"
          : "outlined"
      }
      onClick={() => {
        if (
          grades?.[course.id ?? ""] === undefined ||
          !grades?.[course.id ?? ""]
        ) {
          return;
        }
        const tab =
          selectedTab == selectedCourses.indexOf(course)
            ? -1
            : selectedCourses.indexOf(course);
        setSelectedTab(tab);
        localStorage.setItem("selectedTab", tab.toString());
      }}
    >
      <span>{course?.name}</span>|
      <span className={"opacity-80 font-light"}>{course?.id}</span>
      <TooltipProvider
        delayDuration={
          grades?.[course.id ?? ""] === undefined || !grades?.[course.id ?? ""]
            ? 300
            : 100
        }
      >
        <Tooltip>
          <TooltipTrigger className={"h-4 w-4"}>
            <span
              className={
                "h-4 w-4 flex flex-row items-center hover:text-red-500 active:text-red-600 transition-all justify-center"
              }
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCourses(
                  selectedCourses.filter(
                    (selectedCourse) => selectedCourse.name !== course.name,
                  ),
                );
                if (
                  selectedTab !== null &&
                  selectedTab == selectedCourses.indexOf(course)
                ) {
                  setSelectedTab(-1);
                } else {
                  setSelectedTab(
                    selectedCourses.indexOf(selectedCourses[selectedTab ?? 0]) -
                      1,
                  );
                }
              }}
            >
              <LucideX size={14} />
            </span>
          </TooltipTrigger>
          <TooltipContent>הסרת קורס</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Button>
  );
};

export default CourseSelectionHeader;
