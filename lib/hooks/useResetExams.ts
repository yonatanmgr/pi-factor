import {useEffect} from "react";
import {useCourseFilters} from "@/lib/store";
import {AllTimeCourseInfo} from "@/lib/types";

const useResetExams = (selectedCourse: AllTimeCourseInfo | null) => {
  const { setVisibility, visibleMoeds, visibleGroups } = useCourseFilters();
  useEffect(() => {
    if (selectedCourse?.id) {
      if (
        ![...Object.keys(visibleMoeds), ...Object.keys(visibleGroups)].some(
          (m) => m.startsWith(selectedCourse.id ?? ""),
        )
      )
        for (const semester of selectedCourse.semesters ?? []) {
          setVisibility("moed", selectedCourse.id + ":" + semester + "0", true);
          setVisibility(
            "group",
            selectedCourse.id + ":" + semester + "00",
            true,
          );
        }
    }
  }, [selectedCourse]);
};

export default useResetExams;