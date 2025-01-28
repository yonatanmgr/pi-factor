import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
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
import CourseList from "@/components/CourseList";
import { TRANSLATIONS } from "@/lib/constants";
import { useSettings } from "@/lib/store";
import { ibmPlexSansArabic, ibmPlexSansHebrew } from "@/lib/fonts";
import { AnimatePresence, motion } from "motion/react";

interface CourseSelectionHeaderProps {
  isMobile: boolean;
  isLoading: boolean;
  selectedCourses: AllTimeCourseInfo[];
  setSelectedCourses: (courses: AllTimeCourseInfo[]) => void;
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
  options: { [id: string]: AllTimeCourseInfo & { id: string } };
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
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
  grades,
}: CourseSelectionHeaderProps) => {
  const { language } = useSettings();

  return (
    <header
      className={
        "flex flex-row gap-2 snap-x snap-proximity overflow-x-auto overflow-y-hidden min-h-fit"
      }
    >
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant={"outlined"}
              className={"bg-zinc-50 snap-start snap-normal dark:bg-zinc-900 border"}
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
              className={
                "flex flex-col max-w-md mx-auto gap-4 h-full w-full p-4 pt-5"
              }
            >
              <CourseList
                {...{
                  selectedCourses,
                  setSelectedCourses,
                  onSelectedOptions,
                  setSelectedTab,
                  options,
                  isLoading,
                }}
              />
              {/*<DrawerFooter className="pt-1"></DrawerFooter>*/}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"outlined"}
              className={"bg-zinc-50 dark:bg-zinc-900 border snap-start snap-normal"}
              disabled={isLoading}
            >
              <LucideBookPlus
                className={"text-zinc-500 dark:text-zinc-400"}
                size={14}
              />
              {TRANSLATIONS[language].edit_courses}
            </Button>
          </DialogTrigger>
          <DialogContent
            className={cn(
              "min-w-[300px]",
              language === "ar" && ibmPlexSansArabic.className,
            )}
            dir={dir(language)}
          >
            <DialogTitle
              title={
                TRANSLATIONS[language].edit_courses + selectedCourses.length
                  ? ` (${selectedCourses.length})`
                  : ""
              }
            >
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
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      {!selectedCourses?.length && (
        <span
          className={
            "min-w-fit text-sm h-9 mx-1 text-zinc-500 dark:text-zinc-400 select-none flex flex-row items-center"
          }
        >
          {TRANSLATIONS[language].selected_courses_will_appear_here}
        </span>
      )}
      <AnimatePresence mode={"popLayout"}>
        {selectedCourses?.map((course) => (
          <motion.div
            className={"snap-start snap-normal"}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            key={course.id}
          >
            <SelectedCourseButton
              key={course?.name}
              course={course}
              grades={grades}
              selectedCourses={selectedCourses}
              setSelectedCourses={setSelectedCourses}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          </motion.div>
        ))}
      </AnimatePresence>
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
          : "ghost"
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
      <span className={ibmPlexSansHebrew.className}>{course?.name}</span>|
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
