import { useCourseFilters, useSettings } from "@/lib/store";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "@/lib/api";
import { Language, SemesterCourses, SemesterGroupGradeInfo } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/constants";
import { getMoedsList, getSemesterName } from "@/lib/utils";
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

interface SemesterData {
  semesterName: string;
  averageMean: number;
  lecturers: Set<string>;
  lecturersList: string;
  groups: string[];
  moeds: number[];
  selectedMoedsLabel: string;
  selectedGroupsLabel: string;
  isValidating: boolean;
  handleGroupSelect: (group: string, checked: Checked) => void;
  handleMoedSelect: (moed: string, checked: Checked) => void;
}

export function useSemesterData(
  semester: string,
  courseId: string,
  grades: { [group: string]: SemesterGroupGradeInfo[] | undefined } | undefined,
): SemesterData {
  const { visibleGroups, visibleMoeds, setVisibility } = useCourseFilters();
  const { language } = useSettings();

  const { data: semesterInfo, isValidating } = useSWRImmutable<SemesterCourses>(
    `https://arazim-project.com/data/courses-${semester}.json`,
    fetcher,
  );

  // Get sorted groups
  const groups = Object.keys(grades ?? {}).sort();

  const { semesterName, lecturersList, lecturers } = extractSemesterSearchData(
    semester,
    courseId,
    semesterInfo,
    language,
  );

  // Get unique sorted moeds
  const moeds = Array.from(
    new Set(
      Object.values(grades ?? {})
        .map((grade) => grade?.map((v: any) => v.moed ?? 0) ?? [])
        .flat(),
    ),
  ).sort();

  // Calculate selected moeds label
  const selectedMoeds = Object.entries(visibleMoeds).filter(
    (m) => m[1] && m[0].startsWith(courseId + ":" + semester),
  ).map((m) => m[0]);

  // Calculate selected moeds label
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
    groups.map((g) => grades?.[g]?.[0]?.mean ?? 0).reduce((a, b) => a + b, 0) /
    groups.length;

  const handleGroupSelect = (group: string, checked: Checked) => {
    if (group === "00") {
      setVisibility("group", courseId + ":" + semester + "00", checked === true);
      for (const g of groups) {
        if (g !== "00") setVisibility("group", courseId + ":" + semester + g, false);
      }
    } else {
      setVisibility("group", courseId + ":" + semester + "00", false);
      setVisibility("group", courseId + ":" + semester + group, checked === true);
    }
  };

  const handleMoedSelect = (moed: string, checked: Checked) => {
    if (parseInt(moed) === 0) {
      setVisibility("moed", courseId + ":" + semester + "0", checked === true);
      for (const m of moeds) {
        if (parseInt(m) !== 0) setVisibility("moed", courseId + ":" + semester + m, false);
      }
    } else {
      setVisibility("moed", courseId + ":" + semester + moed, checked === true);
      setVisibility("moed", courseId + ":" + semester + "0", false);
    }
  };

  return {
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
  };
}
