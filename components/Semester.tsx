import React, { forwardRef, useEffect } from "react";
import { SemesterGroupGradeInfo } from "@/lib/types";
import { LucideUsers } from "lucide-react";
import { TRANSLATIONS } from "@/lib/constants";
import { motion } from "motion/react";
import { cn, getAllGroups, getMoedsList } from "@/lib/utils/utils";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import { useSemesterData } from "@/lib/hooks/useSemesterData";
import { useCourseFilters, useSemesters, useSettings } from "@/lib/store";
import { CheckboxDropdown } from "@/components/CheckboxDropdown";
import { Toggle } from "@/components/ui/toggle";

interface SemesterProps {
  semester: string;
  courseId: string;
  grades: { [group: string]: SemesterGroupGradeInfo[] | undefined } | undefined;
  searchQuery?: string;
}

const Semester = forwardRef<HTMLDivElement, SemesterProps>(
  ({ semester, grades, courseId, searchQuery }: SemesterProps, ref) => {
    const { language } = useSettings();
    const { visibleGroups, visibleMoeds, toggleMoed } = useCourseFilters();
    const { setMatchesSearch } = useSemesters();

    const {
      semesterName,
      averageMean,
      lecturers,
      lecturersList,
      groups,
      moeds,
      selectedGroupsLabel,
      isValidating,
      handleGroupSelect,
    } = useSemesterData(semester, courseId, grades);

    const matchesSearch = searchQuery?.split(" ").every((word) => {
      return `${semesterName} ${lecturersList}`
        .toLowerCase()
        .trim()
        .replace(" ", "")
        .replace(",", "")
        .includes(word.toLowerCase().trim());
    });

    useEffect(() => {
      setMatchesSearch(semester, matchesSearch ?? false);
    }, [matchesSearch]);

    if (!grades || isValidating || !matchesSearch) {
      return <></>;
    }

    return (
      <motion.div
        ref={ref}
        key={`semester-${semester}`}
        initial={{ opacity: 0, y: 5, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 5, scale: 0.99 }}
        transition={{ duration: 0.3 }}
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
              {lecturers.size == 1
                ? TRANSLATIONS[language].lecturer
                : TRANSLATIONS[language].lecturers}
              :{" "}
              <span className={cn("font-bold", ibmPlexSansHebrew.className)}>
                {lecturers.size ? (
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
              label={selectedGroupsLabel}
              items={groups.map((g) => ({
                label:
                  getAllGroups(g, language) ??
                  TRANSLATIONS[language].group + " " + g,
                value: g,
                checked: visibleGroups[courseId + ":" + semester + g],
              }))}
              onSelect={handleGroupSelect}
            />
            <div className="flex flex-row gap-1 w-1/2">
              {moeds.map((m) => (
                <Toggle
                  className={"grow"}
                  variant={"outline"}
                  key={courseId + ":" + semester + m}
                  pressed={visibleMoeds[courseId + ":" + semester + m] ?? false}
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
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

Semester.displayName = "Semester";

export default Semester;
