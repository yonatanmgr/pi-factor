"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SemesterGroupGradeInfo } from "@/lib/types";
import { useCourseFilters } from "@/lib/store";
import { useMemo, useState } from "react";

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
    color: "hsl(var(--chart-1))",
  },
  "50-59": {
    label: "50-59",
    color: "hsl(var(--chart-2))",
  },
  "60-64": {
    label: "60-64",
    color: "hsl(var(--chart-3))",
  },
  "65-69": {
    label: "65-69",
    color: "hsl(var(--chart-4))",
  },
  "70-74": {
    label: "70-74",
    color: "hsl(var(--chart-5))",
  },
  "75-79": {
    label: "75-79",
    color: "hsl(var(--chart-5))",
  },
  "80-84": {
    label: "80-84",
    color: "hsl(var(--chart-5))",
  },
  "85-89": {
    label: "85-89",
    color: "hsl(var(--chart-5))",
  },
  "90-94": {
    label: "90-94",
    color: "hsl(var(--chart-5))",
  },
  "95-100": {
    label: "95-100",
    color: "hsl(var(--chart-5))",
  },
  "200-210": {
    label: "200-210",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export const textToRGB = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
};

export function GradeChart({ data }: ChartProps) {
  const { visibleGroups, visibleMoeds } = useCourseFilters();

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

  const chartData = useMemo(() => {
    // let total = 0;
    // Object.keys(preprocessedData).forEach((key) => {
    //   if (visibleMoeds[key.split("-")[0]] && visibleGroups[key.split("-")[1]]) {
    //     preprocessedData[key].forEach((value) => {
    //       total += value;
    //     });
    //   }
    // });

    return GRADE_LABELS.map((label, index) => {
      const entry: any = { gradeRange: label };
      Object.keys(preprocessedData).forEach((key) => {
        if (
          visibleMoeds[key.split("-")[0]] &&
          visibleGroups[key.split("-")[1]] &&
          preprocessedData[key][index] !== undefined
        ) {
          entry[key] = (entry[key] || 0) + preprocessedData[key][index];
        }
      });
      return entry;
    });
  }, [groupsKeys, moedsKeys]);

  if (!data) {
    return null;
  }

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="gradeRange"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip
          content={<ChartTooltipContent dir={"rtl"} nameKey={"label"} />}
        />
        {/*<ChartLegend content={<ChartLegendContent/>}/>*/}
        {Array.from(barKeys).map(({ key, label }) => (
          <Bar
            name={label}
            key={key}
            isAnimationActive={false}
            //   animationDuration={50}
            dataKey={key}
            stackId="a"
            fill={"#" + textToRGB(key)}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
