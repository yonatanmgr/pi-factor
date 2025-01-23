import { SemesterCourses, SemesterGroupGradeInfo } from "@/lib/types";
import { useCourseFilters } from "@/lib/store";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "@/lib/api";
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CheckboxDropdown } from "@/components/CheckboxDropdown";
import { LucidePencil, LucideUsers } from "lucide-react";
import { GROUPS, MOEDS } from "@/lib/constants";

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
  }, [grades, courseId, semester]);

  const lecturers = new Set<string>();
  for (const group of semesterInfo?.[courseId]?.groups ?? []) {
    if (!group.lessons?.some((lesson) => lesson.type === "שיעור")) {
      continue;
    }

    for (const lecturer of group.lecturer?.split(",") ?? []) {
      lecturers.add(lecturer.trim());
    }
  }
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
    return <Card className={"flex p-2 h-[106px] w-full animate-pulse opacity-80 bg-zinc-50 rounded-md flex-col gap-1"}></Card>
  }

  const moeds = Array.from(
    new Set(
      Object.values(grades ?? {})
        .map((grade) => grade?.map((v: any) => v.moed ?? 0) ?? [])
        .flat(),
    ),
  ).sort();

  const selectedMoeds = Object.entries(visibleMoeds).filter(
    (m) => m[1] && m[0].startsWith(semester),
  );
  const selectedMoedsLabel =
    selectedMoeds.length === 0
      ? "אף מועד"
      : selectedMoeds.length === 1 && selectedMoeds[0][0].endsWith("0")
        ? "מועד קובע"
        : (selectedMoeds.length === 1 ? "מועד " : "מועדים ") +
          selectedMoeds
            .filter((m) => !m[0].endsWith("0"))
            .map((m) => MOEDS[parseInt(m[0][m[0].length - 1])].split(" ")[1])
            .join(", ");

  const selectedGroups = Object.entries(visibleGroups).filter(
    (g) => g[1] && g[0].startsWith(semester),
  );
  const selectedGroupsLabel =
    selectedGroups.length === 0
      ? "אף קבוצה"
      : selectedGroups.length === 1 && selectedGroups[0][0].endsWith("00")
        ? "כל הקבוצות"
        : (selectedGroups.length === 1 ? "קבוצה " : "קבוצות ") +
          selectedGroups
            .filter((g) => !g[0].endsWith("00"))
            .map((g) => g[0].slice(-2))
            .join(", ");

  const avarageMean = groups
    .map((g) => grades[g]?.[0]?.mean ?? 0)
    .reduce((a, b) => a + b, 0) / groups.length;

  return (
    <Card className={"flex p-2 bg-zinc-50 rounded-md flex-col gap-1"}>
      <h3 className={"font-bold flex flex-row items-center justify-between pl-1"}>
        {semester.replace("a", " א'").replace("b", " ב'")}
        <span className={"font-normal text-sm text-zinc-500"}>
          ממוצע: {" "}
          <span className={"font-bold text-zinc-800"}>{avarageMean ? avarageMean.toFixed(2) : "אין מידע"}</span>
        </span>
      </h3>
      <div className={"flex flex-col gap-1"}>
        <div className={"flex flex-row gap-1 text-sm"}>
          <span className={"font-normal text-zinc-500"}>
            {lecturers.size == 1 ? "מרצה" : "מרצים"}:{" "}
            <span className={"font-bold text-zinc-800"}>
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

export default Semester;
