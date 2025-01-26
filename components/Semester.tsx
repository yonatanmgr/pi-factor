import React, { forwardRef } from "react";
import { SemesterCourses, SemesterGroupGradeInfo } from "@/lib/types";
import { useCourseFilters, useSettings } from "@/lib/store";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "@/lib/api";
import { CheckboxDropdown } from "@/components/CheckboxDropdown";
import { LucidePencil, LucideUsers } from "lucide-react";
import { TRANSLATIONS } from "@/lib/constants";
import { motion } from "motion/react";
import { cn, getAllGroups, getMoedsList, getSemesterName } from "@/lib/utils";
import { ibmPlexSansHebrew } from "@/lib/fonts";

interface SemesterProps {
  semester: string;
  courseId: string;
  grades: { [group: string]: SemesterGroupGradeInfo[] | undefined } | undefined;
}

const Semester = forwardRef<HTMLDivElement, SemesterProps>(
  ({ semester, grades, courseId }: SemesterProps, ref) => {
    const { visibleGroups, visibleMoeds, setVisibility } = useCourseFilters();
    const { language } = useSettings();

    const { data: semesterInfo, isValidating } =
      useSWRImmutable<SemesterCourses>(
        `https://arazim-project.com/data/courses-${semester}.json`,
        fetcher,
      );

    const groups = Object.keys(grades ?? {}).sort();

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
      return <></>;
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
        ? TRANSLATIONS[language].no_moed
        : selectedMoeds.length === 1 && selectedMoeds[0][0].endsWith("0")
          ? TRANSLATIONS[language].decisive_moed
          : (selectedMoeds.length === 1
              ? TRANSLATIONS[language].moed
              : TRANSLATIONS[language].moeds) +
            " " +
            selectedMoeds
              .filter((m) => !m[0].endsWith("0"))
              .map(
                (m) =>
                  getMoedsList(language)[parseInt(m[0][m[0].length - 1])].split(
                    " ",
                  )[1],
              )
              .join(", ");

    const selectedGroups = Object.entries(visibleGroups).filter(
      (g) => g[1] && g[0].startsWith(semester),
    );
    const selectedGroupsLabel =
      selectedGroups.length === 0
        ? TRANSLATIONS[language].no_group
        : selectedGroups.length === 1 && selectedGroups[0][0].endsWith("00")
          ? TRANSLATIONS[language].all_groups
          : (selectedGroups.length === 1
              ? TRANSLATIONS[language].group
              : TRANSLATIONS[language].groups) +
            " " +
            selectedGroups
              .filter((g) => !g[0].endsWith("00"))
              .map((g) => g[0].slice(-2))
              .join(", ");

    const avarageMean =
      groups.map((g) => grades[g]?.[0]?.mean ?? 0).reduce((a, b) => a + b, 0) /
      groups.length;

    return (
      <motion.div
        ref={ref}
        key={`semester-${semester}`}
        initial={{ opacity: 0, y: 5, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 5, scale: 0.99 }}
        transition={{ duration: 0.3 }}
        className={
          "flex p-2 bg-zinc-50 dark:bg-zinc-900 overflow-x-hidden rounded-md flex-col gap-1 border bg-card text-card-foreground shadow-sm"
        }
      >
        <h3
          className={
            "font-bold flex flex-row items-center justify-between pl-1"
          }
        >
          {getSemesterName(semester, language)}
          <span
            className={"font-normal text-sm text-zinc-700 dark:text-zinc-300"}
          >
            {TRANSLATIONS[language].mean}:{" "}
            <span className={"font-bold"}>
              {avarageMean
                ? avarageMean.toFixed(2)
                : TRANSLATIONS[language].no_info}
            </span>
          </span>
        </h3>
        <div className={"flex flex-col gap-1"}>
          <div className={"flex flex-row gap-1 text-sm"}>
            <span className={"font-normal text-zinc-700 dark:text-zinc-300"}>
              {lecturers.size == 1
                ? TRANSLATIONS[language].lecturer
                : TRANSLATIONS[language].lecturers}
              :{" "}
              <span className={cn("font-bold", ibmPlexSansHebrew.className)}>
                {lecturers.size
                  ? Array.from(lecturers).join(", ")
                  : TRANSLATIONS[language].unknown}
              </span>
            </span>
          </div>
          <div className={"w-full flex flex-row justify-evenly gap-2 mt-1"}>
            <CheckboxDropdown
              icon={
                <LucideUsers
                  size={15}
                  className={"text-zinc-600 dark:text-zinc-300"}
                />
              }
              label={selectedGroupsLabel}
              items={groups.map((g) => ({
                label:
                  getAllGroups(g, language) ??
                  TRANSLATIONS[language].group + " " + g,
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
              icon={
                <LucidePencil
                  size={15}
                  className={"text-zinc-600 dark:text-zinc-300"}
                />
              }
              label={selectedMoedsLabel}
              items={moeds.map((m) => ({
                label: getMoedsList(language)[m],
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
      </motion.div>
    );
  },
);

Semester.displayName = "Semester";

export default Semester;
