"use client";

import { useWindowSize } from "usehooks-ts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SemesterGroupGradeInfo } from "@/lib/types";
import { useCourseFilters } from "@/lib/store";
import * as React from "react";
import { useMemo, useState } from "react";
import { LucideUserX } from "lucide-react";

const MOEDS = ["מועד קובע", "מועד א'", "מועד ב'", "מועד ג'"];

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
    icon: LucideUserX,
  },
} satisfies ChartConfig;

export const textToRGB = (text: string) => {
  let hash = 0;
  text.split("").forEach((char: string) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};

export function GradeChart({ data }: ChartProps) {
  const { visibleGroups, visibleMoeds } = useCourseFilters();
  const { width } = useWindowSize();
  const isMobile = width < 640;

  const [barKeys, setBarKeys] = useState<Set<{ key: string; label: string }>>(
    new Set(),
  );

  const preprocessedData = useMemo(() => {
    if (!data) return {};
    const preprocessed: { [key: string]: number[] } = {};
    const newBarKeys = new Set<{ key: string; label: string }>();

    Object.keys(data).forEach((semester) => {
      Object.keys(data[semester] ?? {}).forEach((groupKey) => {
        const group = data[semester]?.[groupKey];
        if (group) {
          group.forEach((moed) => {
            if (moed.distribution) {
              const key = `${semester}${moed.moed}-${semester}${groupKey}`;
              const label = `${semester.replace("a", " א'").replace("b", " ב'")} - ${groupKey == "00" ? "כל הקבוצות" : "קבוצה " + groupKey} - ${MOEDS[moed.moed ?? 0]}`;
              newBarKeys.add({ key, label });
              preprocessed[key] = moed.distribution;
            }
          });
        }
      });
    });

    setBarKeys(newBarKeys);
    return preprocessed;
  }, [data]);

  const groupsKeys = Object.keys(visibleGroups);
  const moedsKeys = Object.keys(visibleMoeds);

  const chartData: Array<{ [key: string]: number | string }> = useMemo(() => {
    return GRADE_LABELS.map((label, index) => {
      const entry = { gradeRange: label };
      Object.keys(preprocessedData).forEach((key) => {
        if (
          visibleMoeds[key.split("-")[0]] &&
          visibleGroups[key.split("-")[1]] &&
          preprocessedData[key][index] !== undefined
        ) {
          // @ts-ignore
          entry[key] = (entry[key] || 0) + preprocessedData[key][index];
        }
      });
      return entry;
    });
  }, [groupsKeys, moedsKeys]);

  if (!data) {
    return null;
  }

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
      return { ...acc, [key]: ((entry[key] as number) / grandTotal) * 100 };
    }, {});
  });

  return (
    <ChartContainer className={"grow lg:w-full h-full"} config={chartConfig}>
      <BarChart accessibilityLayer data={dataAsPercentage}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="gradeRange"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis unit={"%"} tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip
          trigger={isMobile ? "click" : "hover"}
          content={
            <ChartTooltipContent
              formatter={(v, n, i) => {
                return (
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
                      <span className={"text-zinc-700 dark:text-zinc-200"}>
                        {n}
                      </span>
                    </section>
                    <span className={"font-mono font-bold pl-1"}>
                      {parseFloat(v.toString()).toFixed(2)}%
                    </span>
                  </div>
                );
              }}
              labelFormatter={(v) => (
                <span>
                  טווח ציונים: <span className={"font-bold"}>{v}</span>
                </span>
              )}
              dir={"rtl"}
              nameKey={"label"}
            />
          }
        />
        {Array.from(barKeys).map(({ key, label }) => (
          <Bar
            name={label}
            key={key}
            // isAnimationActive={false}
            unit={"%"}
            dataKey={key}
            stackId="a"
            fill={textToRGB(label)}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
