import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {LucideBookPlus, LucideListFilter, LucideTrash, LucideX} from "lucide-react";
import { GradeChart } from "@/components/Chart";
import React, {useEffect, useState} from "react";
import VirtualizedList from "@/components/list";
import {AllTimeCourseInfo, SemesterGroupGradeInfo} from "@/lib/types";
import { useViewport } from "@/components/CheckboxDropdown";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Semester from "@/components/Semester";
import {useCourseFilters} from "@/lib/store";

const snapPoints = ['355px', 1];

interface MainSectionProps {
  selectedCourses: any[];
  setSelectedCourses: any;
  selectedTab: number;
  setSelectedTab: any;
  grades: any;
  selectedCourse: AllTimeCourseInfo | null;
  currentCourseGrades:
      | {
    [p: string]:
        | { [p: string]: SemesterGroupGradeInfo[] | undefined }
        | undefined;
  }
      | null
      | undefined;  options: {
    [id: string]: AllTimeCourseInfo & { id: string };
  };
  isLoading: boolean;
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
}

interface CourseListProps {
  options: {
    [id: string]: AllTimeCourseInfo & { id: string };
  };
  isLoading: boolean;
  selectedCourses: any[];
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
  setSelectedCourses: any;
  setSelectedTab: any;
}

const CourseList = ({
  options,
  isLoading,
  selectedCourses,
  onSelectedOptions,
  setSelectedTab,
  setSelectedCourses,
}: CourseListProps) => {
  return (
    <div className={"flex flex-col gap-2"}>
      <VirtualizedList
        options={options ?? {}}
        isLoading={isLoading}
        selectedOptions={selectedCourses ?? []}
        onSelectedOption={onSelectedOptions}
      />

      <Button
        className={"bg-zinc-50 dark:bg-zinc-900 border w-full"}
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
  const { visibleMoeds, clearMoeds, setVisibility } = useCourseFilters();
  const { isMobile } = useViewport();
  const [showSemesters, setShowSemesters] = React.useState(true);

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
        "sm:min-h-full max-sm:grow h-fit overflow-hidden flex flex-col gap-2 p-2 sm:h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-950 border"
      }
    >
      <header
        className={
          "flex flex-row gap-2 overflow-x-auto overflow-y-hidden min-h-fit"
        }
      >
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                className={"bg-zinc-50 dark:bg-zinc-900 border"}
                variant={"secondary"}
                disabled={isLoading}
              >
                <LucideBookPlus className={"text-zinc-500 dark:text-zinc-400"} size={14} />
                עריכת קורסים
              </Button>
            </DrawerTrigger>
            <DrawerContent dir={"rtl"} className={"px-4"}>
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
              <DrawerFooter className="pt-1"></DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={"outlined"}
                disabled={isLoading}
              >
                <LucideBookPlus className={"text-zinc-500 dark:text-zinc-400"} size={14} />
                עריכת קורסים
              </Button>
            </DialogTrigger>
            <DialogContent className={"min-w-[300px]"} dir={"rtl"}>
              <DialogTitle>
                <h2 className={"text-xl font-bold select-none"}>
                  עריכת קורסים
                  {selectedCourses?.length > 0 && (
                    <span className={"text-zinc-500 dark:text-zinc-400"}>
                      {" "}
                      ({selectedCourses.length})
                    </span>
                  )}
                </h2>
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
              "w-full text-sm h-9 mr-1 text-zinc-400 select-none flex flex-row items-center"
            }
          >
            קורסים נבחרים יופיעו כאן...
          </span>
        )}
        {selectedCourses?.map((course) => (
          <Button
            tooltipproviderprops={{ delayDuration: 300 }}
            tooltip={
              grades?.[course.id ?? ""] === undefined ||
              !grades?.[course.id ?? ""] ? (
                <span>אין נתוני ציונים זמינים</span>
              ) : null
            }
            key={course?.name}
            className={cn(
              (grades?.[course.id ?? ""] === undefined ||
                !grades?.[course.id ?? ""]) &&
                "opacity-50 cursor-help",
            )}
            variant={selectedTab !== null &&
                selectedTab == selectedCourses.indexOf(course) ? "default" : "outlined"}
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
                grades?.[course.id ?? ""] === undefined ||
                !grades?.[course.id ?? ""]
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
                          (selectedCourse) =>
                            selectedCourse.name !== course.name,
                        ),
                      );
                      if (
                        selectedTab !== null &&
                        selectedTab == selectedCourses.indexOf(course)
                      ) {
                        setSelectedTab(-1);
                      } else {
                        setSelectedTab(
                          selectedCourses.indexOf(
                            selectedCourses[selectedTab ?? 0],
                          ) - 1,
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
        ))}
      </header>
      <section
        className={"grow rounded-md w-full bg-zinc-50 dark:bg-zinc-900 border overflow-hidden"}
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
        {selectedCourses.length > 0 && selectedTab < 0 && (
          <div
            className={
              "w-full h-full text-lg px-10 text-center text-zinc-400 select-none flex flex-row items-center justify-center"
            }
          >
            סמנו קורס מלמעלה כדי לראות את התפלגות הציונים שלו...
          </div>
        )}
        {selectedCourses.length > 0 && selectedTab > -1 && selectedCourse && (
          <div dir={"rtl"} className={"px-4 py-3 h-full flex flex-col gap-2 max-h-full"}>
            <div className={"flex flex-row flex-wrap gap-2 text-2xl"}>
              {selectedCourse?.name && (
                  <span className={"font-bold"}>
                  {selectedCourse?.name}
                  {selectedCourse?.id && (
                    <span className={"font-light"}>
                      {" "}
                      | {selectedCourse?.id}
                    </span>
                  )}
                </span>
              )}
            </div>

            <span className={"font-bold"}>
              פקולטה:{" "}
              <span className={"font-normal"}>{selectedCourse?.faculty}</span>
            </span>

            <div className={"w-full h-px bg-zinc-300/50 my-2"}></div>
            <div className={"grow h-full w-full overflow-auto"}>
              <GradeChart data={currentCourseGrades} />
            </div>
            {isMobile ? (
                <Drawer snapPoints={snapPoints} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
                  <DrawerTrigger asChild>
                    <Button
                        className={"bg-zinc-50 w-full dark:bg-zinc-900 border"}
                        variant={"secondary"}
                        disabled={isLoading}
                    >
                      <LucideListFilter className={"text-zinc-500 dark:text-zinc-400"} size={14} />
                      סינון מועדים
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent
                      className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]"
                      dir={"rtl"}>
                    <div
                        className={cn('flex flex-col max-w-md mx-auto gap-4 w-full p-4 pt-5', {
                          'overflow-y-auto': snap === 1,
                          'overflow-hidden': snap !== 1,
                        })}
                    >
                      {selectedCourse &&
                          Object.entries(currentCourseGrades ?? {}).some(
                              (o) => Object.values(o[1] ?? {}).length,
                          ) && (
                              <>
                                {/*<div className={"h-px w-full bg-zinc-300/50 my-2"}></div>*/}
                                <header
                                    className={
                                      "flex flex-row gap-2 justify-between w-full items-center"
                                    }
                                    onClick={(e) => {
                                      isMobile && setShowSemesters(!showSemesters);
                                      e.stopPropagation();
                                    }}
                                >
                                  <h2
                                      className={
                                        "text-lg pr-1 font-bold select-none flex flex-row gap-2 items-center"
                                      }
                                  >
                                    <LucideListFilter className={"text-zinc-500 dark:text-zinc-400"} size={20}/>
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
                                    <LucideTrash className={"text-red-500"} size={14}/> נקה מועדים
                                  </Button>
                                </header>

                                {showSemesters && (
                                    <div className={""}>
                                      <div className={"flex flex-col gap-2"}>
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
                                )}
                              </>
                          )}
                    </div>
                  </DrawerContent>
                </Drawer>
            ) : (
                <></>
            )}
          </div>
        )}
      </section>
    </section>
  );
};

export default MainSection;
