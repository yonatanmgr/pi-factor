"use client";

import { useOnClickOutside, useWindowSize } from "usehooks-ts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SemesterGroupGradeInfo } from "@/lib/types";
import { useCourseFilters, useSettings } from "@/lib/store";
import * as React from "react";
import { useMemo, useRef, useState } from "react";
import { dir, getMoedsList, getSemesterName } from "@/lib/utils/utils";
import { TRANSLATIONS } from "@/lib/constants";

const GRADE_LABELS = [
  "0-49",
  "50-59",
  "60-64",
  "65-69",
  "70-74",
  "75-79",
  "80-84",
  "85-89",
  "90-94",
  "95-100",
  "200-210",
];

interface ChartProps {
  data:
    | {
        [semester: string]:
          | { [group: string]: SemesterGroupGradeInfo[] | undefined }
          | undefined;
      }
    | null
    | undefined;
  courseId: string;
  view: "stacked" | "grouped";
}

const chartConfig = {
  "0-49": {
    label: "0-49",
  },
  "50-59": {
    label: "50-59",
  },
  "60-64": {
    label: "60-64",
  },
  "65-69": {
    label: "65-69",
  },
  "70-74": {
    label: "70-74",
  },
  "75-79": {
    label: "75-79",
  },
  "80-84": {
    label: "80-84",
  },
  "85-89": {
    label: "85-89",
  },
  "90-94": {
    label: "90-94",
  },
  "95-100": {
    label: "95-100",
  },
  "200-210": {
    label: "200-210",
  },
} satisfies ChartConfig;

export const textToHSL = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 55%, 55%)`;
};

export function GradeChart({ data, courseId, view }: ChartProps) {
  const { visibleGroups, visibleMoeds } = useCourseFilters();
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const { language } = useSettings();
  const ref = useRef(null);
  const [showTooltip, setShowTooltip] = useState(true);

  const handleClickOutside = () => {
    showTooltip && setShowTooltip(false);
  };

  const handleClickInside = () => {
    !showTooltip && setShowTooltip(true);
  };

  //@ts-ignore
  useOnClickOutside(ref, handleClickOutside, "touchstart");

  const [barKeys, setBarKeys] = useState<
    Set<{ key: string; label: string; gradeRange?: string }>
  >(new Set());

  const preprocessedData = useMemo(() => {
    if (!data) return {};
    const preprocessed: { [key: string]: number[] } = {};
    const newBarKeys = new Set<{
      key: string;
      label: string;
      gradeRange?: string;
    }>();

    Object.keys(data).forEach((semester) => {
      Object.keys(data[semester] ?? {}).forEach((groupKey) => {
        const group = data[semester]?.[groupKey];
        if (group) {
          group.forEach((moed) => {
            if (moed.distribution) {
              const key = `${courseId}:${semester}${moed.moed}-${semester}${groupKey}`;
              const label = `${getSemesterName(semester, language)} - ${groupKey == "00" ? TRANSLATIONS[language].all_groups : TRANSLATIONS[language].group + " " + groupKey} - ${getMoedsList(language)[moed.moed ?? 0]}`;
              newBarKeys.add({ key, label });
              preprocessed[key] = moed.distribution;
            }
          });
        }
      });
    });

    setBarKeys(newBarKeys);
    return preprocessed;
  }, [data, language]);

  const groupsKeys = Object.keys(visibleGroups);
  const moedsKeys = Object.keys(visibleMoeds);

  const chartData: Array<{ [key: string]: number | string }> = useMemo(() => {
    return GRADE_LABELS.map((label, index) => {
      const entry = { gradeRange: label };
      Object.keys(preprocessedData).forEach((key) => {
        const moed = key.split(":")[1].split("-")[0];
        const group = key.split(":")[1].split("-")[1];
        if (
          visibleMoeds[courseId + ":" + moed] &&
          visibleGroups[courseId + ":" + group] &&
          preprocessedData[key][index] !== undefined
        ) {
          if (preprocessedData[key][index]) {
            // @ts-ignore
            entry[key] = (entry[key] || 0) + preprocessedData[key][index];
          }
        }
      });
      return entry;
    });
  }, [courseId, groupsKeys, moedsKeys, language]);

  const totalStudentsPerMoed = useMemo(() => {
    return Object.fromEntries(
      Object.entries(preprocessedData).map(([key, value]) => {
        return [key, value.reduce((acc, curr) => acc + curr, 0)];
      }),
    );
  }, [preprocessedData]);

  const totalPerGradeRange = chartData.reduce((acc, curr) => {
    const total = Object.values(curr).reduce((acc: number, curr) => {
      if (typeof curr === "number") {
        return acc + (curr as number);
      }
      return acc;
    }, 0);
    return { ...acc, [curr.gradeRange]: total };
  }, {}) as { [key: string]: number };

  const grandTotal: number = Object.values(totalPerGradeRange).reduce(
    (acc: number, curr: number) => acc + curr,
    0,
  );

  const dataAsPercentage = chartData.map((entry) => {
    return Object.keys(entry).reduce((acc, key) => {
      if (key === "gradeRange") {
        return { ...acc, gradeRange: entry.gradeRange };
      }
      const total = view === "grouped" ? totalStudentsPerMoed[key] : grandTotal;
      return { ...acc, [key]: ((entry[key] as number) / total) * 100 };
    }, {});
  });

  const barKeysValues = barKeys.values();
  const barKeysInData = Array.from(barKeysValues).filter((b) =>
    Array.from(chartData.map((c) => Object.keys(c)))
      .flat()
      .includes(b.key),
  );

  const newBarKeys = new Set(barKeysInData);

  if (!data) {
    return <></>;
  }

  return (
    <ChartContainer
      onTouchStart={handleClickInside}
      ref={ref}
      className={"grow lg:w-full h-full"}
      config={chartConfig}
    >
      <BarChart
        accessibilityLayer
        data={dataAsPercentage.filter((d) => Object.keys(d).length > 1)}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="gradeRange"
          tickLine={false}
          tickMargin={8}
          angle={isMobile ? -25 : 0}
          interval={0}
        />
        <YAxis unit={"%"} tickLine={false} tickMargin={25} axisLine={false} />
        <ChartTooltip
          animationEasing={"ease-in-out"}
          animationDuration={100}
          active={isMobile ? (showTooltip ? undefined : false) : undefined}
          trigger={isMobile ? "click" : "hover"}
          content={
            <ChartTooltipContent
              className={
                "bg-neutral-50/70 max-sm:pointer-events-auto dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 p-2 rounded-md max-sm:max-h-60 max-sm:overflow-y-auto"
              }
              formatter={(v, n, i) => (
                <div className={"flex flex-row gap-1 items-center w-full"}>
                  <section
                    className={"flex flex-row gap-1.5 items-center grow"}
                  >
                    <div
                      className={
                        "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg) h-2.5 w-2.5 mt-[1px]"
                      }
                      style={
                        {
                          "--color-bg": i.color,
                          "--color-border": i.color,
                        } as React.CSSProperties
                      }
                    />
                    <span className={"text-neutral-700 dark:text-neutral-200"}>
                      {n}
                    </span>
                  </section>
                  <span className={"font-mono font-bold pl-1"}>
                    {parseFloat(v.toString()).toFixed(2)}%
                  </span>
                </div>
              )}
              labelFormatter={(v) => (
                <span>
                  {TRANSLATIONS[language].grade_range}:{" "}
                  <span className={"font-bold"}>{v}</span>
                </span>
              )}
              dir={dir(language)}
              nameKey={"label"}
            />
          }
        />
        {Array.from(newBarKeys).map(({ key, label }) => (
          <Bar
            name={label}
            key={key.split(":")[1]}
            unit={"%"}
            radius={view === "grouped" ? [4, 4, 0, 0] : 0}
            dataKey={key}
            stackId={view === "stacked" ? "a" : label}
            fill={textToHSL(key)}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
