import { useCourseFilters, useSettings } from "@/lib/store";
import { Language, SemesterCourses, SemesterGroupGradeInfo } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/constants";
import { getMoedsList, getSemesterName } from "@/lib/utils/utils";
import { Checked } from "@/components/CheckboxDropdown";

export function extractSemesterSearchData(
  semester: string,
  courseId: string,
  semesterInfo: SemesterCourses | undefined,
  language: Language,
) {
  const lecturers = new Set<string>();

  // Extract lecturers
  for (const group of semesterInfo?.[courseId]?.groups ?? []) {
    if (!group.lessons?.some((lesson) => lesson.type === "שיעור")) {
      continue;
    }

    for (const lecturer of group.lecturer?.split(",") ?? []) {
      lecturers.add(lecturer.trim());
    }
  }

  // If no lecturers found in שיעור, get from all groups
  if (lecturers.size === 0) {
    for (const group of semesterInfo?.[courseId]?.groups ?? []) {
      for (const lecturer of group.lecturer?.split(",") ?? []) {
        lecturers.add(lecturer.trim());
      }
    }
  }

  return {
    semesterName: getSemesterName(semester, language),
    lecturersList: Array.from(lecturers).join(", "),
    lecturers,
  };
}

export interface SemesterData {
  semesterName: string;
  averageMean: number;
  lecturers: Set<string>;
  lecturersList: string;
  groups: string[];
  moeds: number[];
  selectedGroupsLabel: string;
  isValidating: boolean;
  handleGroupSelect: (group: string, checked: Checked) => void;
}

export function processSemesterData(
  semester: string,
  courseId: string,
  grades: { [group: string]: SemesterGroupGradeInfo[] | undefined } | undefined,
  semesterInfo: SemesterCourses | undefined,
): Omit<SemesterData, "isValidating"> {
  // Get sorted groups
  const groups = Object.keys(grades ?? {}).sort();

  const language = useSettings.getState().language;

  const { semesterName, lecturersList, lecturers } = extractSemesterSearchData(
    semester,
    courseId,
    semesterInfo,
    language,
  );

  const visibleGroups = useCourseFilters.getState().visibleGroups;
  const visibleMoeds = useCourseFilters.getState().visibleMoeds;
  const setVisibility = useCourseFilters.getState().setVisibility;

  // Get unique sorted moeds
  const moeds = Array.from(
    new Set(
      Object.values(grades ?? {})
        .map((grade) => grade?.map((v: any) => v.moed ?? 0) ?? [])
        .flat(),
    ),
  ).sort();

  // Calculate selected moeds label
  const selectedMoeds = Object.entries(visibleMoeds)
    .filter((m) => m[1] && m[0].startsWith(courseId + ":" + semester))
    .map((m) => m[0]);

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
    groups.map((g) => grades?.[g]?.[0]?.mean ?? 0).reduce((a, b) => a + b, 0) /
    groups.length;

  const handleGroupSelect = (group: string, checked: Checked) => {
    if (group === "00") {
      setVisibility(
        "group",
        courseId + ":" + semester + "00",
        checked === true,
      );
      for (const g of groups) {
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

  return {
    semesterName,
    averageMean,
    lecturers,
    lecturersList,
    groups,
    moeds,
    selectedGroupsLabel,
    handleGroupSelect,
  };
}


