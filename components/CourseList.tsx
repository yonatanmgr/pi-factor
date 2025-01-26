import { AllTimeCourseInfo } from "@/lib/types";
import VirtualizedList from "@/components/list";
import { Button } from "@/components/ui/button";
import { LucideSaveAll, LucideTrash } from "lucide-react";
import React from "react";
import { TRANSLATIONS } from "@/lib/constants";
import { useSettings } from "@/lib/store";
import { DrawerClose } from "@/components/ui/drawer";

interface CourseListProps {
  options: { [id: string]: AllTimeCourseInfo & { id: string } };
  isLoading: boolean;
  selectedCourses: AllTimeCourseInfo[];
  onSelectedOptions: (option: AllTimeCourseInfo) => void;
  setSelectedCourses: (courses: AllTimeCourseInfo[]) => void;
  setSelectedTab: (tab: number) => void;
}

const CourseList = ({
  options,
  isLoading,
  selectedCourses,
  onSelectedOptions,
  setSelectedTab,
  setSelectedCourses,
}: CourseListProps) => {
  const { language } = useSettings();

  return (
    <div className={"flex h-full flex-col gap-2 overflow-x-hidden"}>
      <VirtualizedList
        options={options ?? {}}
        isLoading={isLoading}
        selectedOptions={selectedCourses ?? []}
        onSelectedOption={onSelectedOptions}
      />
      <section className={"flex flex-row gap-2 w-full items-center"}>
        <Button
          className={"bg-zinc-50 dark:bg-zinc-900 border w-full"}
          variant={"outlined"}
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
        <DrawerClose asChild>
          <Button
            className={"bg-zinc-50 dark:bg-zinc-900 border w-full"}
            variant={"outlined"}
            disabled={!selectedCourses?.length}
          >
            <LucideSaveAll size={14} /> {TRANSLATIONS[language].save_selection}
          </Button>
        </DrawerClose>
      </section>
    </div>
  );
};

export default CourseList;
