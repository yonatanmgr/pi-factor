import { AllTimeCourseInfo, SemesterGroupGradeInfo } from "@/lib/types";
import ExamsList from "@/components/ExamsList";
import useResetExams from "@/lib/hooks/useResetExams";

interface SidebarProps {
  selectedCourse: AllTimeCourseInfo | null;
  currentCourseGrades:
    | {
        [p: string]:
          | { [p: string]: SemesterGroupGradeInfo[] | undefined }
          | undefined;
      }
    | null
    | undefined;
}

const Sidebar = ({ selectedCourse, currentCourseGrades }: SidebarProps) => {
  useResetExams(selectedCourse);

  return (
    <section
      className={
        "max-h-full sm:min-h-full sm:h-full max-sm:min-h-fit min-w-1/4 sm:overflow-y-hidden overflow-x-hidden p-2 flex flex-col gap-2 sm:w-1/4 w-full min-w-[300px] rounded-xl bg-neutral-100 dark:bg-neutral-900/30 dark:border-neutral-500/20 border"
      }
    >
      <ExamsList
        selectedCourse={selectedCourse}
        currentCourseGrades={currentCourseGrades}
      />
    </section>
  );
};

export default Sidebar;
