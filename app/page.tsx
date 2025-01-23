"use client";
import React, { useEffect, useState } from "react";
import { fetcher, useCourses, useGrades } from "@/lib/api";
import VirtualizedList from "@/components/ui/list";
import {
  AllTimeCourseInfo,
  SemesterCourses,
  SemesterGroupGradeInfo,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {LucidePencil, LucideTrash, LucideUsers, LucideX} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradeChart } from "@/components/Chart";
import useSWRImmutable from "swr/immutable";
import { useCourseFilters } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { CheckboxDropdown } from "@/components/CheckboxDropdown";

export const runtime = "edge";
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

// const getDefaultVisibleGroups = (
//   semester: string,
//   grades:
//     | {
//         [group: string]: SemesterGroupGradeInfo[] | undefined;
//       }
//     | undefined,
// ) => {
//   const visibleGroups: { [key: string]: boolean } = {};
//   for (const group of Object.keys(grades ?? {})) {
//     visibleGroups[semester + group] = true;
//   }
//   console.log(visibleGroups);
//   return visibleGroups;
// };

const MOEDS = ["מועד קובע", "מועד א'", "מועד ב'", "מועד ג'"];
const GROUPS: { [key: string]: string } = {
  "00": "כל הקבוצות",
};

interface SemesterProps {
  semester: string;
  courseId: string;
  grades: { [group: string]: SemesterGroupGradeInfo[] | undefined } | undefined;
}

const Semester = ({ semester, grades, courseId }: SemesterProps) => {
  const { visibleGroups, visibleMoeds, setVisibility } = useCourseFilters();

  const { data: semesterInfo, isValidating } = useSWRImmutable<SemesterCourses>(
    `https://arazim-project.com/data/courses-${semester}.json`,
    fetcher,
  );

  // const maxMoed = Math.max(
  //   ...Object.values(grades ?? {}).map((grade) =>
  //     Math.max(...(grade?.map((v: any) => v.moed ?? 0) ?? [0])),
  //   ),
  // );

  const groups = Object.keys(grades ?? {}).sort();

  useEffect(() => {
    setVisibility("group", semester + "00", true);
    setVisibility("moed", semester + "0", true);
  }, []);

  const lecturers = new Set<string>();
  // Initially, only show teahers of שיעור.
  for (const group of semesterInfo?.[courseId]?.groups ?? []) {
    if (!group.lessons?.some((lesson) => lesson.type === "שיעור")) {
      continue;
    }

    for (const lecturer of group.lecturer?.split(",") ?? []) {
      lecturers.add(lecturer.trim());
    }
  }
  // If this is empty, show everyone.
  if (lecturers.size === 0) {
    for (const group of semesterInfo?.[courseId]?.groups ?? []) {
      for (const lecturer of group.lecturer?.split(",") ?? []) {
        lecturers.add(lecturer.trim());
      }
    }
  }

  if (!grades) {
    return <></>;
  }

  if (isValidating) {
    return <></>;
  }

  const moeds = Array.from(
    new Set(
      Object.values(grades ?? {})
        .map((grade) => grade?.map((v: any) => v.moed ?? 0) ?? [])
        .flat(),
    ),
  ).sort();

  const selectedMoeds = Object.entries(visibleMoeds).filter((m) => m[1] && m[0].startsWith(semester));
  const selectedMoedsLabel = selectedMoeds.length === 0 ? "אף מועד" :
    selectedMoeds.length === 1 && selectedMoeds[0][0].endsWith("0")
      ? "מועד קובע"
      : (selectedMoeds.length === 1 ? "מועד " : "מועדים ")+
        selectedMoeds
          .filter((m) => !m[0].endsWith("0"))
          .map((m) => MOEDS[parseInt(m[0][m[0].length - 1])].split(" ")[1])
          .join(", ");

  const selectedGroups = Object.entries(visibleGroups).filter((g) => g[1] && g[0].startsWith(semester));
    const selectedGroupsLabel = selectedGroups.length === 0 ? "אף קבוצה" :
        selectedGroups.length === 1 && selectedGroups[0][0].endsWith("00")
        ? "כל הקבוצות"
        : (selectedGroups.length === 1 ? "קבוצה " : "קבוצות ")+
            selectedGroups
                .filter((g) => !g[0].endsWith("00"))
                .map((g) => g[0].slice(-2))
                .join(", ");

  return (
    <Card className={"flex p-2 bg-zinc-50/50 rounded-md flex-col gap-1"}>
      <h3 className={"font-bold"}>
        {semester.replace("a", " א'").replace("b", " ב'")}
      </h3>
      <div className={"flex flex-col gap-1"}>
        <div className={"flex flex-row gap-1 text-sm"}>
          <span className={"font-bold"}>
            {lecturers.size == 1 ? "מרצה" : "מרצים"}: {" "}
            <span className={"font-normal"}>
              {lecturers.size ? Array.from(lecturers).join(", ") : "לא ידוע"}
            </span>
          </span>
        </div>
        <div className={"w-full flex flex-row justify-evenly gap-2"}>
          <CheckboxDropdown
            icon={<LucideUsers size={15} className={"text-zinc-600"} />}
            label={selectedGroupsLabel}
            items={groups.map((g) => ({
              label: GROUPS[g] ?? "קבוצה " + g,
              value: g,
              checked: visibleGroups[semester + g],
            }))}
            onSelect={(group, checked) => {
              if (group === "00") {
                setVisibility("group", semester + "00", checked == true);
                for (const g of groups) {
                  if (g !== "00") setVisibility("group", semester + g, false);
                }
              } else {
                setVisibility("group", semester + "00", false);
                setVisibility("group", semester + group, checked == true);
              }
            }}
          />
          <CheckboxDropdown
            icon={<LucidePencil size={15} className={"text-zinc-600"} />}
            label={selectedMoedsLabel}
            items={moeds.map((m) => ({
              label: MOEDS[m],
              value: m,
              checked: visibleMoeds[semester + m],
            }))}
            onSelect={(moed, checked) => {
              if (parseInt(moed) === 0) {
                setVisibility("moed", semester + "0", checked == true);
                for (const m of moeds) {
                  if (parseInt(m) !== 0)
                    setVisibility("moed", semester + m, false);
                }
              } else {
                setVisibility("moed", semester + moed, checked == true);
                setVisibility("moed", semester + "0", false);
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default function Home() {
  const { courses, isLoading } = useCourses();
  const { grades } = useGrades();
  const options =
    Object.fromEntries(
      Object.entries(courses ?? {}).map((c) => [c[0], { ...c[1], id: c[0] }]),
    ) ?? null;
  const [selectedCourses, setSelectedCourses] = useState<
    AllTimeCourseInfo[] | null
  >(null);
  const [selectedTab, setSelectedTab] = useState<number | null>(null);

  const {  visibleMoeds,  clearMoeds } = useCourseFilters();

  const onSelectedOptions = (course: AllTimeCourseInfo) => {
    if (selectedCourses) {
      if (
        selectedCourses.some(
          (selectedCourse) => selectedCourse.name === course.name,
        )
      ) {
        setSelectedCourses(
          selectedCourses.filter(
            (selectedCourse) => selectedCourse.name !== course.name,
          ),
        );
        setSelectedTab(
          selectedCourses.indexOf(selectedCourses[selectedTab ?? 0]) - 1,
        );
      } else {
        setSelectedCourses([...selectedCourses, course]);
      }
    } else {
      setSelectedCourses([course]);
    }
  };

  const selectedCourse =
    selectedTab === null ? null : (selectedCourses ?? [])[selectedTab];

  const currentCourseGrades = selectedCourse
    ? (grades ?? {})[selectedCourse.id ?? ""]
    : null;


  useEffect(() => {
    if (selectedCourse) {
      clearMoeds();
    }
  }, [selectedCourse]);

  return (
    <main
      dir={"rtl"}
      className={
        "flex text-zinc-800 sm:overflow-hidden flex-col gap-4 p-4 items-center h-screen min-h-screen max-h-screen justify-between"
      }
    >
      <header className={"w-full flex flex-row items-stretch"}>
        <h1 className={"text-3xl font-black select-none"}>📊 Pi-Factor</h1>
      </header>
      <section
        dir={"rtl"}
        className={
          "flex sm:flex-row sm:overflow-y-hidden flex-col gap-4 w-full items-center h-full justify-between"
        }
      >
        <section
          className={
            "max-h-full sm:min-h-full sm:h-full max-sm:min-h-fit sm:overflow-y-hidden overflow-x-hidden p-2 flex flex-col gap-2 sm:w-1/4 w-full min-w-[300px] rounded-lg bg-zinc-100 border"
          }
        >
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
                setSelectedCourses(null);
                setSelectedTab(null);
              }}
            >
              <LucideTrash className={"text-red-500"} size={14} />                   נקה בחירה
            </Button>
          </div>
          {selectedCourse &&
            Object.entries(currentCourseGrades ?? {}).some(
              (o) => Object.values(o[1] ?? {}).length,
            ) && (
              <>
                <div className={"h-px w-full bg-zinc-300/50 my-2"}></div>
                <header className={"flex flex-row gap-2 justify-between w-full items-center"}>
                <h2 className={"text-xl font-bold select-none"}>סינון מועדים</h2>
                  <Button
                      disabled={!Object.values(visibleMoeds).some((v) => v)}
                      className={"bg-zinc-50 border"}
                      variant={"secondary"}
                      onClick={clearMoeds}
                  >
                    <LucideTrash className={"text-red-500"} size={14} />                   נקה מועדים
                  </Button>

                </header>

                <div className={"grow overflow-hidden"}>
                  <div
                    className={"flex flex-col gap-2 max-h-full overflow-auto"}
                  >
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
        <section
          className={
            "sm:min-h-full max-sm:grow h-fit flex flex-col gap-2 p-3 sm:h-full sm:w-3/4 w-full rounded-lg bg-zinc-100 border"
          }
        >
          <header className={"flex flex-row gap-2 flex-wrap min-h-10"}>
            {!selectedCourses?.length && (
              <span
                className={
                  "w-full h-9 mr-1 text-zinc-400 select-none flex flex-row items-center"
                }
              >
                קורסים נבחרים יופיעו כאן...
              </span>
            )}
            {selectedCourses?.map((course) => (
              <Button
                  title={grades?.[course.id ?? ""] === undefined || !grades?.[course.id ?? ""] ? "אין נתוני ציונים זמינים" : ""}
                key={course.name}
                className={cn(
                  "bg-zinc-50 border",
                  selectedTab !== null &&
                    selectedTab == selectedCourses.indexOf(course) &&
                    "bg-zinc-800 text-zinc-50 hover:bg-zinc-900",
                  (grades?.[course.id ?? ""] === undefined || !grades?.[course.id ?? ""]) && "opacity-50 cursor-help",
                )}
                variant={"secondary"}
                onClick={() => {
                  if (grades?.[course.id ?? ""] === undefined || !grades?.[course.id ?? ""]) {
                    return;
                  }
                  setSelectedTab(
                    selectedTab == selectedCourses.indexOf(course)
                      ? null
                      : selectedCourses.indexOf(course),
                  );
                }
                }
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
                      setSelectedTab(null);
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
              </Button>
            ))}
          </header>
          <section
            className={
              "grow rounded-md w-full bg-zinc-50 border overflow-hidden"
            }
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
            {selectedCourses && (selectedTab === null) && (
              <div
                className={
                  "w-full h-full text-lg px-10 text-center text-zinc-400 select-none flex flex-row items-center justify-center"
                }
              >
                סמנו קורס מלמעלה כדי לראות את התפלגות הציונים שלו...
              </div>
            )}
            {selectedCourses && selectedTab !== null && selectedCourse && (
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
      </section>
    </main>
  );
}
