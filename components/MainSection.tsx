import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideBookPlus, LucideTrash, LucideX } from "lucide-react";
import { GradeChart } from "@/components/Chart";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import VirtualizedList from "@/components/ui/list";
import { AllTimeCourseInfo } from "@/lib/types";
import { useViewport } from "@/components/CheckboxDropdown";
import {Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger} from "@/components/ui/drawer";

interface MainSectionProps {
  selectedCourses: any[];
  setSelectedCourses: any;
  selectedTab: number;
  setSelectedTab: any;
  grades: any;
  selectedCourse: any;
  currentCourseGrades: any;
  options: {
    [id: string]: AllTimeCourseInfo & { id: string };
  };
  isLoading: boolean;
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
}

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
  const { isMobile } = useViewport();

  const CourseList = () => {
    return (
      <div className={"flex flex-col gap-2"}>
        <VirtualizedList
          options={options ?? {}}
          isLoading={isLoading}
          selectedOptions={selectedCourses ?? []}
          onSelectedOption={onSelectedOptions}
        />

        <Button
          className={"bg-zinc-50 border"}
          variant={"secondary"}
          disabled={!selectedCourses?.length}
          onClick={() => {
            setSelectedCourses([]);
            localStorage.setItem("selectedCourses", "[]");
            setSelectedTab(-1);
          }}
        >
          <LucideTrash className={"text-red-500"} size={14} /> נקה בחירה
        </Button>
      </div>
    );
  };

  return (
    <section
      className={
        "sm:min-h-full max-sm:grow h-fit flex flex-col gap-2 p-3 sm:h-full sm:w-3/4 w-full rounded-lg bg-zinc-100 border"
      }
    >
      <header
        className={
          "flex flex-row gap-2 overflow-x-auto overflow-y-hidden min-h-10"
        }
      >
        {!selectedCourses?.length && (
          <span
            className={
              "w-full h-9 mr-1 text-zinc-400 select-none flex flex-row items-center"
            }
          >
            קורסים נבחרים יופיעו כאן...
          </span>
        )}
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                className={"bg-zinc-50 border"}
                variant={"secondary"}
                disabled={isLoading}
              >
                <LucideBookPlus className={"text-zinc-500"} size={14} />
                הוסף קורס
              </Button>
            </DrawerTrigger>
            <DrawerContent dir={"rtl"} className={"px-4"}>
              <CourseList />
                <DrawerFooter className="pt-1">
                </DrawerFooter>

            </DrawerContent>
          </Drawer>
        ) : (
          <Popover modal={false}>
            <PopoverTrigger asChild>
              <Button
                className={"bg-zinc-50 border"}
                variant={"secondary"}
                disabled={isLoading}
              >
                <LucideBookPlus className={"text-zinc-500"} size={14} />
                הוסף קורס
              </Button>
            </PopoverTrigger>
            <PopoverContent className={"min-w-[300px]"} dir={"rtl"}>
              <CourseList />
            </PopoverContent>
          </Popover>
        )}
        {selectedCourses?.map((course) => (
          <Button
            title={
              grades?.[course.id ?? ""] === undefined ||
              !grades?.[course.id ?? ""]
                ? "אין נתוני ציונים זמינים"
                : ""
            }
            key={course.name}
            className={cn(
              "bg-zinc-50 border",
              selectedTab !== null &&
                selectedTab == selectedCourses.indexOf(course) &&
                "bg-zinc-800 text-zinc-50 hover:bg-zinc-900",
              (grades?.[course.id ?? ""] === undefined ||
                !grades?.[course.id ?? ""]) &&
                "opacity-50 cursor-help",
            )}
            variant={"secondary"}
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
            <span className={"opacity-80 font-light"}>{course.id}</span>
            <span
              className={
                "h-4 w-4 flex flex-row items-center cursor-pointer hover:text-red-500 active:text-red-600 transition-all justify-center"
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
          </Button>
        ))}
      </header>
      <section
        className={"grow rounded-md w-full bg-zinc-50 border overflow-hidden"}
      >
        {!selectedCourses?.length && (
          <div
            className={
              "w-full h-full text-lg px-10 text-center text-zinc-400 select-none flex flex-row items-center justify-center"
            }
          >
            הוסיפו קורסים מהרשימה...
          </div>
        )}
        {selectedCourses.length > 0 && selectedTab === -1 && (
          <div
            className={
              "w-full h-full text-lg px-10 text-center text-zinc-400 select-none flex flex-row items-center justify-center"
            }
          >
            סמנו קורס מלמעלה כדי לראות את התפלגות הציונים שלו...
          </div>
        )}
        {selectedCourses.length > 0 &&
          selectedTab !== null &&
          selectedCourse && (
            <div className={"px-4 py-3 flex flex-col gap-2 max-h-full"}>
              <div className={"flex flex-col sm:flex-row gap-2 text-2xl"}>
                {selectedCourse?.name && (
                  <span className={"font-bold"}>{selectedCourse?.name}</span>
                )}
                {selectedCourse?.id && (
                  <span className={"font-light"}>| {selectedCourse?.id}</span>
                )}
              </div>
              <div className={"flex flex-row gap-1"}>
                <span className={"font-bold"}>פקולטה:</span>
                <span>{selectedCourse?.faculty}</span>
              </div>
              <div className={"w-full h-px bg-zinc-300/50 my-2"}></div>
              <div className={"grow h-1/2 w-full overflow-auto"}>
                <GradeChart data={currentCourseGrades} />
              </div>
            </div>
          )}
      </section>
    </section>
  );
};

export default MainSection;
