import React, { useMemo, useRef, useState } from "react";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import { AllTimeCourseInfo, AllTimeCourses } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  LucideCheckSquare,
  LucideSquare,
} from "lucide-react";
import { TRANSLATIONS } from "@/lib/constants";
import { useSettings } from "@/lib/store";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import { useWindowSize } from "usehooks-ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

interface VirtualizedListProps {
  options: AllTimeCourses;
  isLoading: boolean;
  onSelectedOption: (option: AllTimeCourseInfo) => void;
  selectedOptions: AllTimeCourseInfo[];
}

const sortByIdThenName = (
  a: [string, AllTimeCourseInfo | undefined],
  b: [string, AllTimeCourseInfo | undefined],
) => {
  if (!a[1] && !b[1]) {
    return 0;
  }
  if (a[0] === b[0]) {
    if (a[1]?.name ?? "" === b[1]?.name ?? "") {
      return 0;
    } else {
      return (a[1]?.name ?? "") < (b[1]?.name ?? "") ? -1 : 1;
    }
  }
  return a[0] < b[0] ? -1 : 1;
};

interface VirtualRow {
  type: "group" | "subgroup" | "item";
  content: any;
  groupName?: string;
  subgroupName?: string;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  options,
  onSelectedOption,
  isLoading,
  selectedOptions,
}) => {
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  // Initialize with all groups and subgroups expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Get all faculty names from options
    const groups = new Set<string>();
    Object.values(options ?? {}).forEach((course) => {
      if (course?.faculty) {
        const faculty = course.faculty.split("/")[0] || "לא ממוין";
        groups.add(faculty);
      }
    });
    return groups;
  });

  const [expandedSubgroups, setExpandedSubgroups] = useState<Set<string>>(
    () => {
      // Get all faculty/subgroup combinations from options
      const subgroups = new Set<string>();
      Object.values(options ?? {}).forEach((course) => {
        if (course?.faculty) {
          const faculty = course.faculty.split("/")[0] || "לא ממוין";
          const subgroup = course.faculty.split("/")[1] || "לא ממוין";
          subgroups.add(`${faculty}/${subgroup}`);
        }
      });
      return subgroups;
    },
  );

  const { language } = useSettings();
  const isMobile = useWindowSize().width < 640;

  const filteredOptions = useMemo(
    () =>
      Object.entries(options ?? {})
        .filter(
          ([id, course]) =>
            id
              .toLowerCase()
              .includes(search.trim().replace("-", "").toLowerCase()) ||
            course?.name
              ?.toLowerCase()
              .includes(search.trim().replace("-", "").toLowerCase()) ||
            course?.faculty
              ?.toLowerCase()
              .includes(search.trim().replace("-", "").toLowerCase()),
        )
        .sort(sortByIdThenName),
    [search, options],
  );

  const groupedWithSubgroups = useMemo(() => {
    const grouped: {
      [faculty: string]: { [subgroup: string]: [string, AllTimeCourseInfo][] };
    } = {};

    for (const [id, course] of filteredOptions) {
      if (!course) continue;

      const faculty = course.faculty?.split("/")[0] || "לא ממוין";
      const subgroup = course.faculty?.split("/")[1] || "לא ממוין";

      if (!grouped[faculty]) {
        grouped[faculty] = {};
      }
      if (!grouped[faculty][subgroup]) {
        grouped[faculty][subgroup] = [];
      }

      grouped[faculty][subgroup].push([id, course]);
    }

    return grouped;
  }, [filteredOptions]);

  const virtualRows = useMemo(() => {
    const rows: VirtualRow[] = [];

    Object.entries(groupedWithSubgroups).forEach(([groupName, subgroups]) => {
      // Add group header
      rows.push({ type: "group", content: groupName, groupName });

      if (expandedGroups.has(groupName)) {
        Object.entries(subgroups).forEach(([subgroupName, items]) => {
          // Add subgroup header
          rows.push({
            type: "subgroup",
            content: subgroupName,
            groupName,
            subgroupName,
          });

          if (expandedSubgroups.has(`${groupName}/${subgroupName}`)) {
            // Add items
            items.forEach((item) => {
              rows.push({
                type: "item",
                content: item,
                groupName,
                subgroupName,
              });
            });
          }
        });
      }
    });

    return rows;
  }, [groupedWithSubgroups, expandedGroups, expandedSubgroups]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = virtualRows[index];
      return row.type === "item" ? 47 : 40;
    },
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const toggleSubgroup = (groupName: string, subgroupName: string) => {
    const key = `${groupName}/${subgroupName}`;
    setExpandedSubgroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (virtualRows.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        setFocusedIndex((prev) =>
          prev === null || prev === virtualRows.length - 1 ? 0 : prev + 1,
        );
        break;
      case "ArrowUp":
        setFocusedIndex((prev) =>
          prev === null || prev === 0 ? virtualRows.length - 1 : prev - 1,
        );
        break;
      case "Enter":
        if (focusedIndex !== null) {
          const row = virtualRows[focusedIndex];
          if (row.type === "item") {
            const [, course] = row.content;
            if (course) onSelectedOption(course);
          } else if (row.type === "group") {
            toggleGroup(row.content);
          } else if (row.type === "subgroup") {
            toggleSubgroup(row.groupName!, row.content);
          }
        }
        break;
      default:
        break;
    }
  };

  const renderVirtualRow = (virtualRow: VirtualItem) => {
    const row = virtualRows[virtualRow.index];
    const isFocused = focusedIndex === virtualRow.index;

    if (row.type === "group") {
      return (
        <div
          key={virtualRow.key}
          className={cn(
            "absolute flex flex-row select-none items-center hover:brightness-[0.98] active:brightness-[0.95] dark:hover:brightness-[1.25] dark:active:brightness-[1.7] px-3 py-2 font-semibold transition-transform",
            isFocused
              ? "bg-neutral-200/70 dark:bg-neutral-800/70"
              : "bg-neutral-200/50 dark:bg-neutral-800/80",
            expandedGroups.has(row.content) &&
              "bg-neutral-200/90 dark:bg-neutral-700/90",
          )}
          style={{
            transform: `translateY(${virtualRow.start}px)`,
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => toggleGroup(row.content)}
        >
          {expandedGroups.has(row.content) ? (
            <ChevronDown size={20} className="ltr:mr-2 rtl:ml-2" />
          ) : (
            <ChevronLeft size={20} className="ltr:mr-2 ltr:rotate-180 rtl:ml-2" />
          )}
          <span className={cn(ibmPlexSansHebrew.className)}>{row.content}</span>
        </div>
      );
    }

    if (row.type === "subgroup") {
      const key = `${row.groupName}/${row.content}`;
      return (
        <div
          key={virtualRow.key}
          className={cn(
            "absolute flex flex-row select-none items-center hover:brightness-[0.98] active:brightness-[0.95] dark:hover:brightness-[1.25] dark:active:brightness-[1.7] px-6 py-2 font-medium transition-transform",
            isFocused
              ? "bg-neutral-200/70 dark:bg-neutral-800/70"
              : "bg-neutral-100 dark:bg-neutral-800/30",
            expandedSubgroups.has(key) && "bg-neutral-200/60 dark:bg-neutral-800/80",
          )}
          style={{
            transform: `translateY(${virtualRow.start}px)`,
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => toggleSubgroup(row.groupName!, row.content)}
        >
          {expandedSubgroups.has(key) ? (
            <ChevronDown size={16} className="ltr:mr-1 rtl:ml-1" />
          ) : (
            <ChevronLeft size={16} className="ltr:mr-1 ltr:rotate-180 rtl:ml-1" />
          )}
          <span className={cn(ibmPlexSansHebrew.className)}>{row.content}</span>
        </div>
      );
    }

    // Item row
    const [option, course] = row.content;
    const isSelected = selectedOptions.some(
      (selectedOption) => selectedOption.id === course?.id,
    );

    return (
      <div
        key={virtualRow.key}
        className={cn(
          "absolute flex group flex-row transition-transform transition justify-between text-[15px] active:bg-neutral-300 dark:active:bg-neutral-700 select-none w-full p-3 ltr:pl-10 rtl:pr-10",
          isFocused
            ? "bg-neutral-200/70 hover:bg-neutral-200/70 dark:bg-neutral-800/70 dark:hover:bg-neutral-800/70"
            : "bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800",
        )}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
        }}
        onClick={() => course && onSelectedOption(course)}
      >
        <span className="flex flex-row gap-2 overflow-x-hidden items-center">
          <span className="text-neutral-500 dark:text-neutral-400 mt-[1px]">
            {isSelected ? (
              <LucideCheckSquare
                className="text-emerald-600 dark:text-emerald-400"
                size={17}
              />
            ) : (
              <LucideSquare size={17} />
            )}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("truncate", ibmPlexSansHebrew.className)}>
                  {course?.name}
                </span>
              </TooltipTrigger>
              <TooltipContent>{course.name ?? option}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span
          className={cn(
            "text-neutral-500 min-w-fit dark:text-neutral-400 font-light",
            language === "he" ? "mr-2" : "ml-2",
          )}
        >
          {option}
        </span>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 w-full overflow-x-hidden transition-all h-full",
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <input
        autoFocus={!isMobile}
        type="text"
        value={search}
        onChange={(e) => {
          setFocusedIndex(e.target.value ? 0 : null);
          setSearch(e.target.value);
        }}
        placeholder={TRANSLATIONS[language].search_placeholder}
        className="p-2 rounded-md border placeholder:text-sm border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:dark:border-neutral-700 focus:border-neutral-300 transition-all"
      />

      {isLoading && (
        <div className="min-h-52 sm:h-72 transition-all items-center text-neutral-400 select-none justify-center flex flex-row gap-2 border bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md">
          <Spinner />
          <span>{TRANSLATIONS[language].loading_data}</span>
        </div>
      )}
      {virtualRows.length === 0 && !isLoading && (
        <div className="min-h-52 sm:h-72 transition-all items-center text-neutral-400 select-none justify-center flex flex-col border gap-0 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md">
          <span>{TRANSLATIONS[language].no_results}</span>
        </div>
      )}
      {virtualRows.length > 0 && (
        <div
          ref={parentRef}
          className="min-h-52 sm:min-h-72 transition-all h-full overflow-y-auto overflow-x-hidden border gap-0 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md"
          style={{ contain: "strict" }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map(renderVirtualRow)}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedList;
