import { AllTimeCourseInfo } from "@/lib/types";
import VirtualizedList from "@/components/list";
import { Button } from "@/components/ui/button";
import { LucideTrash } from "lucide-react";
import React from "react";
import { snapPoint } from "@/components/MainSection";
import { TRANSLATIONS } from "@/lib/constants";
import { useSettings } from "@/lib/store";

interface CourseListProps {
  options: { [id: string]: AllTimeCourseInfo & { id: string } };
  isLoading: boolean;
  selectedCourses: AllTimeCourseInfo[];
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
  setSelectedCourses: (courses: AllTimeCourseInfo[]) => void;
  setSelectedTab: (tab: number) => void;
  snapPoint: snapPoint;
}

const CourseList = ({
  options,
  isLoading,
  selectedCourses,
  onSelectedOptions,
  setSelectedTab,
  setSelectedCourses,
  snapPoint,
}: CourseListProps) => {
  const { language } = useSettings();

  return (
    <div className={"flex h-full flex-col gap-2 overflow-x-hidden"}>
      <VirtualizedList
        options={options ?? {}}
        isLoading={isLoading}
        selectedOptions={selectedCourses ?? []}
        onSelectedOption={onSelectedOptions}
        snapPoint={snapPoint}
      />
      <Button
        className={"bg-zinc-50 dark:bg-zinc-900 border w-full"}
        variant={"secondary"}
        disabled={!selectedCourses?.length}
        onClick={() => {
          setSelectedCourses([]);
          localStorage.setItem("selectedCourses", "[]");
          setSelectedTab(-1);
          localStorage.setItem("selectedTab", "-1");
        }}
      >
        <LucideTrash className={"text-red-500"} size={14} />{" "}
        {TRANSLATIONS[language].clear_selection}
      </Button>
    </div>
  );
};

export default CourseList;
