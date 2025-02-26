import React, { forwardRef } from "react";
import { SemesterGroupGradeInfo } from "@/lib/types";
import { LucideUsers } from "lucide-react";
import { TRANSLATIONS } from "@/lib/constants";
import { motion } from "motion/react";
import { cn, getAllGroups, getMoedsList } from "@/lib/utils/utils";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import { SemesterData } from "@/lib/hooks/useSemesterData";
import { useCourseFilters, useSettings } from "@/lib/store";
import { CheckboxDropdown, Checked } from "@/components/CheckboxDropdown";
import { Toggle } from "@/components/ui/toggle";

interface SemesterProps {
  semester: string;
  courseId: string;
  grades: { [group: string]: SemesterGroupGradeInfo[] | undefined } | undefined;
  searchQuery?: string;
  semesterData: Omit<SemesterData, "isValidating"> | undefined;
}

const Semester = forwardRef<HTMLDivElement, SemesterProps>(
  (
    { semester, grades, courseId, searchQuery, semesterData }: SemesterProps,
    ref,
  ) => {
    const { language } = useSettings();
    const { visibleGroups, visibleMoeds, toggleMoed } = useCourseFilters();

    const { semesterName, lecturers, groups, moeds } = semesterData ?? {};

    const setVisibility = useCourseFilters.getState().setVisibility;

    // Calculate selected moeds label
    const selectedMoeds = Object.entries(visibleMoeds)
      .filter((m) => m[1] && m[0].startsWith(courseId + ":" + semester))
      .map((m) => m[0]);

    const selectedMoedsLabel =
      selectedMoeds.length === 0
        ? TRANSLATIONS[language].no_moed
        : selectedMoeds.length === 1 && selectedMoeds[0].endsWith("0")
          ? TRANSLATIONS[language].decisive_moed
          : (selectedMoeds.length === 1
              ? TRANSLATIONS[language].moed
              : TRANSLATIONS[language].moeds) +
            " " +
            selectedMoeds
              .filter((m) => !m.endsWith("0"))
              .map(
                (m) =>
                  getMoedsList(language)[parseInt(m[m.length - 1])].split(
                    " ",
                  )[1],
              )
              .join(", ");

    // Calculate selected groups label
    const selectedGroups = Object.entries(visibleGroups).filter(
      (g) => g[1] && g[0].startsWith(courseId + ":" + semester),
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

    // Calculate average mean
    const averageMean =
      (groups ?? [])
        .map((g) => grades?.[g]?.[0]?.mean ?? 0)
        .reduce((a, b) => a + b, 0) / (groups ?? []).length;

    const handleGroupSelect = (group: string, checked: Checked) => {
      if (group === "00") {
        setVisibility(
          "group",
          courseId + ":" + semester + "00",
          checked === true,
        );
        for (const g of groups ?? []) {
          if (g !== "00")
            setVisibility("group", courseId + ":" + semester + g, false);
        }
      } else {
        setVisibility("group", courseId + ":" + semester + "00", false);
        setVisibility(
          "group",
          courseId + ":" + semester + group,
          checked === true,
        );
      }
    };

    if (!grades) {
      return <></>;
    }

    return (
      <motion.div
        layout
        ref={ref}
        key={`semester-${semester}`}
        initial={{ opacity: 0, y: 3, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 3, scale: 0.99 }}
        transition={{ duration: 0.2 }}
        className="flex p-2 bg-linear-to-t from-neutral-50/50 to-neutral-50 dark:from-neutral-900/50 dark:to-neutral-900 rounded-md flex-col gap-1 border bg-card text-card-foreground shadow-sm"
      >
        <h3 className="font-bold flex flex-row items-center justify-between">
          {semesterName}
          <span className="font-normal text-sm text-neutral-700 dark:text-neutral-300">
            {TRANSLATIONS[language].mean}:{" "}
            <span className="font-bold">
              {averageMean ? (
                <span
                  className={"font-mono dark:text-neutral-100 text-neutral-800"}
                >
                  {averageMean.toFixed(2)}
                </span>
              ) : (
                TRANSLATIONS[language].no_info
              )}
            </span>
          </span>
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-1 text-sm">
            <span className="font-normal text-neutral-700 dark:text-neutral-300">
              {lecturers?.size == 1
                ? TRANSLATIONS[language].lecturer
                : TRANSLATIONS[language].lecturers}
              :{" "}
              <span className={cn("font-bold", ibmPlexSansHebrew.className)}>
                {lecturers?.size ? (
                  <span className={"dark:text-neutral-100 text-neutral-800"}>
                    {Array.from(lecturers).join(", ")}
                  </span>
                ) : (
                  TRANSLATIONS[language].unknown
                )}
              </span>
            </span>
          </div>
          <div className="w-full overflow-x-auto rounded-md flex flex-row justify-evenly gap-2 mt-1">
            <CheckboxDropdown
              className={"w-1/2"}
              icon={
                <LucideUsers
                  size={15}
                  className="text-neutral-600 dark:text-neutral-300"
                />
              }
              label={selectedGroupsLabel ?? ""}
              items={(groups ?? []).map((g) => ({
                label:
                  getAllGroups(g, language) ??
                  TRANSLATIONS[language].group + " " + g,
                value: g,
                checked: visibleGroups[courseId + ":" + semester + g],
              }))}
              onSelect={handleGroupSelect ?? (() => {})}
            />
            <div className="flex flex-row gap-1 w-1/2">
              {moeds?.map((m) => {
                const isPressed = visibleMoeds[courseId + ":" + semester + m];
                return (
                  <Toggle
                    className={"grow"}
                    variant={"outline"}
                    key={courseId + ":" + semester + m}
                    pressed={isPressed ?? false}
                    onPressedChange={() =>
                      toggleMoed(courseId + ":" + semester + m)
                    }
                    aria-label={getMoedsList(language)[m]}
                  >
                    {getMoedsList(language)
                      [m].replace(TRANSLATIONS[language].moed, "")
                      .replaceAll("ال", "")
                      .replace("Decisive Ex.", "Des.")}
                  </Toggle>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

Semester.displayName = "Semester";

export default Semester;
