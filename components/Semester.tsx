import React, { forwardRef } from "react";
import { SemesterGroupGradeInfo } from "@/lib/types";
import { CheckboxDropdown } from "@/components/CheckboxDropdown";
import { LucidePencil, LucideUsers } from "lucide-react";
import { TRANSLATIONS } from "@/lib/constants";
import { motion } from "motion/react";
import { cn, getAllGroups, getMoedsList } from "@/lib/utils";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import { useSemesterData } from "@/lib/hooks/useSemesterData";
import { useCourseFilters, useSettings } from "@/lib/store";

interface SemesterProps {
  semester: string;
  courseId: string;
  grades: { [group: string]: SemesterGroupGradeInfo[] | undefined } | undefined;
  searchQuery?: string;
}

const Semester = forwardRef<HTMLDivElement, SemesterProps>(
  ({ semester, grades, courseId, searchQuery }: SemesterProps, ref) => {
    const { language } = useSettings();
    const { visibleGroups, visibleMoeds } = useCourseFilters();

    const {
      semesterName,
      averageMean,
      lecturers,
      lecturersList,
      groups,
      moeds,
      selectedMoedsLabel,
      selectedGroupsLabel,
      isValidating,
      handleGroupSelect,
      handleMoedSelect,
    } = useSemesterData(semester, courseId, grades);

    const matchesSearch = searchQuery?.split(" ").every((word) => {
      return `${semesterName} ${lecturersList}`
        .toLowerCase()
        .trim()
        .replace(" ", "")
        .replace(",", "")
        .includes(word.toLowerCase().trim());
    });

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
        className="flex p-2 bg-zinc-50 dark:bg-zinc-900 rounded-md flex-col gap-1 border bg-card text-card-foreground shadow-sm"
      >
        <h3 className="font-bold flex flex-row items-center justify-between">
          {semesterName}
          <span className="font-normal text-sm text-zinc-700 dark:text-zinc-300">
            {TRANSLATIONS[language].mean}:{" "}
            <span className="font-bold">
              {averageMean
                ? averageMean.toFixed(2)
                : TRANSLATIONS[language].no_info}
            </span>
          </span>
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-1 text-sm">
            <span className="font-normal text-zinc-700 dark:text-zinc-300">
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
          <div className="w-full overflow-x-auto rounded-md flex flex-row justify-evenly gap-2 mt-1">
            <CheckboxDropdown
              icon={
                <LucideUsers
                  size={15}
                  className="text-zinc-600 dark:text-zinc-300"
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
              onSelect={handleGroupSelect}
            />
            <CheckboxDropdown
              icon={
                <LucidePencil
                  size={15}
                  className="text-zinc-600 dark:text-zinc-300"
                />
              }
              label={selectedMoedsLabel}
              items={moeds.map((m) => ({
                label: getMoedsList(language)[m],
                value: m.toString(),
                checked: visibleMoeds[semester + m],
              }))}
              onSelect={handleMoedSelect}
            />
          </div>
        </div>
      </motion.div>
    );
  },
);

Semester.displayName = "Semester";

export default Semester;
