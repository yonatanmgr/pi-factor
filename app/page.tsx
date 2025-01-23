"use client";
import React, { useEffect, useState } from "react";
import { useCourses, useGrades } from "@/lib/api";
import {
  AllTimeCourseInfo,
} from "@/lib/types";
import { useCourseFilters } from "@/lib/store";
import MainSection from "@/components/MainSection";
import Sidebar from "@/components/Sidebar";

export const runtime = "edge";
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

export default function Home() {
  const { courses, isLoading } = useCourses();
  const { grades } = useGrades();
  const options =
    Object.fromEntries(
      Object.entries(courses ?? {}).map((c) => [c[0], { ...c[1], id: c[0] }]),
    ) ?? null;
  const [selectedCourses, setSelectedCourses] = useState<
    AllTimeCourseInfo[]
  >([]);

  useEffect(() => {
    const selectedCourses = localStorage.getItem("selectedCourses");
    if (selectedCourses && !isLoading) {
      setSelectedCourses(
        JSON.parse(selectedCourses).map((id: string) => {
          return options[id];
        }),
      );
    }
  }, [isLoading]);

  useEffect(() => {
    if (selectedCourses.length > 0) {
      localStorage.setItem(
          "selectedCourses",
          JSON.stringify(selectedCourses.map((c) => c.id)),
      );
    }
  }, [selectedCourses]);

  const [selectedTab, setSelectedTab] = useState<number>(-1);

  useEffect(() => {
    if (selectedTab >= 0) {
      localStorage.setItem("selectedTab", selectedTab.toString());
    }
  }, [selectedTab]);

  useEffect(() => {
    const selectedTab = localStorage.getItem("selectedTab");
    if (selectedTab) {
      setSelectedTab(parseInt(selectedTab));
    }
  }, []);

  const { clearMoeds } = useCourseFilters();

  const onSelectedOptions = (course: AllTimeCourseInfo) => {
    if (selectedCourses) {
      if (
        selectedCourses.some(
          (selectedCourse) => selectedCourse.name === course.name,
        )
      ) {
        setSelectedCourses(
          selectedCourses.filter(
            (selectedCourse) => selectedCourse.name !== course.name,
          ),
        );
        localStorage.setItem(
            "selectedCourses",
            JSON.stringify(
                selectedCourses.filter(
                (selectedCourse) => selectedCourse.name !== course.name,
                ),
            ),
          );
        setSelectedTab(
          selectedCourses.indexOf(selectedCourses[selectedTab ?? 0]) - 1,
        );
      } else {
        setSelectedCourses([...selectedCourses, course]);
      }
    } else {
      setSelectedCourses([course]);
    }
  };

  const selectedCourse =
    selectedTab === null ? null : (selectedCourses ?? [])[selectedTab];

  const currentCourseGrades = selectedCourse
    ? (grades ?? {})[selectedCourse.id ?? ""]
    : null;

  useEffect(() => {
    if (selectedCourse) {
      clearMoeds();
    }
  }, [selectedCourse]);

  return (
    <main
      dir={"rtl"}
      className={
        "flex text-zinc-800 sm:overflow-hidden flex-col gap-4 p-4 items-center h-[100dvh] min-h-[100dvh] max-h-[100dvh] justify-between"
      }
    >
      <header className={"w-full flex flex-row items-stretch"}>
        <h1 className={"text-3xl font-black select-none"}>📊 Pi-Factor</h1>
      </header>
      <section
        dir={"rtl"}
        className={
          "flex sm:flex-row sm:overflow-y-hidden flex-col gap-4 w-full items-center h-full justify-between"
        }
      >
        {selectedCourses && selectedTab >= 0 && (
            <Sidebar {...{selectedCourse, currentCourseGrades}} />
        )}
       <MainSection {...{grades, options, onSelectedOptions, isLoading, selectedCourses, setSelectedCourses, selectedTab, setSelectedTab, selectedCourse, currentCourseGrades}} />
      </section>
    </main>
  );
}
