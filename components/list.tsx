import React, { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AllTimeCourseInfo, AllTimeCourses } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { LucideCheckSquare, LucideSquare } from "lucide-react";

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

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  options,
  onSelectedOption,
  isLoading,
  selectedOptions,
}) => {
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const filteredOptions = useMemo(
    () =>
      Object.entries(options ?? {})
        .filter(
          ([id, course]) =>
            id.toLowerCase().includes(search.replace("-", "").toLowerCase()) ||
            course?.name
              ?.toLowerCase()
              .includes(search.replace("-", "").toLowerCase()),
        )
        .sort(sortByIdThenName),
    [search, options],
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 47, // Estimated height for each row (in pixels)
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (filteredOptions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        setFocusedIndex((prev) =>
          prev === null || prev === filteredOptions.length - 1 ? 0 : prev + 1,
        );
        break;
      case "ArrowUp":
        setFocusedIndex((prev) =>
          prev === null || prev === 0 ? filteredOptions.length - 1 : prev - 1,
        );
        break;
      case "Enter":
        if (focusedIndex !== null && filteredOptions[focusedIndex]) {
          const [, course] = filteredOptions[focusedIndex];
          if (course) onSelectedOption(course);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex !== null) {
      rowVirtualizer.scrollToIndex(focusedIndex, {
        align: "center",
        behavior:
          focusedIndex == filteredOptions.length - 1 || focusedIndex == 0
            ? "auto"
            : "smooth",
      });
    }
  }, [focusedIndex, rowVirtualizer, filteredOptions.length]);

  return (
    <div
      className="flex flex-col gap-2 w-full overflow-x-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0} // Makes the container focusable to capture keyboard events
    >
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setFocusedIndex(e.target.value ? 0 : null);
          setSearch(e.target.value);
        }}
        placeholder="חפשו שם או מספר קורס..."
        className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-3 focus:ring-zinc-300 transition-all"
      />

      {isLoading && (
        <div className="h-52 sm:h-72 items-center text-zinc-400 select-none justify-center flex flex-row gap-2 border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md">
          <Spinner />
          <span>טוען נתונים...</span>
        </div>
      )}
      {filteredOptions.length === 0 && !isLoading && (
        <div className="h-52 sm:h-72 items-center text-zinc-400 select-none justify-center flex flex-col border gap-0 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md">
          לא נמצאו תוצאות
        </div>
      )}
      {filteredOptions.length > 0 && (
        <div
          ref={parentRef}
          className="h-52 sm:h-72 overflow-y-auto overflow-x-hidden border gap-0 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md"
          style={{ contain: "strict" }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const [option, course] = filteredOptions[virtualRow.index];
              const isSelected = selectedOptions.some(
                (selectedOption) => selectedOption.name === course?.name,
              );
              const isFocused = focusedIndex === virtualRow.index;

              return (
                <div
                  key={virtualRow.key}
                  className={cn(
                    "absolute flex group flex-row transition-all justify-between text-[15px] active:bg-zinc-300 dark:active:bg-zinc-700 select-none top-0 left-0 w-full p-3",
                    isFocused
                      ? "bg-zinc-200/70 hover:bg-zinc-200/70 dark:bg-zinc-800/70 dark:hover:bg-zinc-800/70"
                      : "bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-900",
                  )}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => {
                    course && onSelectedOption(course);
                  }}
                >
                  <span className={"flex flex-row gap-2 overflow-x-hidden items-center"}>
                    {
                      <span
                        className={"text-zinc-500 dark:text-zinc-400 mt-[1px]"}
                      >
                        {isSelected ? (
                          <LucideCheckSquare size={17} />
                        ) : (
                          <LucideSquare size={17} />
                        )}
                      </span>
                    }
                    <span className={"truncate"}>{course?.name}</span>
                  </span>
                  <span
                    className={"text-zinc-500 mr-2 min-w-fit dark:text-zinc-400 font-light"}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedList;
