"use client";
import React, { useEffect, useState } from "react";
import { useCourses, useGrades } from "@/lib/api";
import { AllTimeCourseInfo, Language } from "@/lib/types";
import MainSection from "@/components/MainSection";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { LucideMoon, LucideSun } from "lucide-react";
import { useDarkMode } from "@/lib/hooks/useDarkMode";
import { useWindowSize } from "usehooks-ts";
import { useSettings } from "@/lib/store";
import { dir } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {TRANSLATIONS} from "@/lib/constants";

export const runtime = "edge";
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

export default function Home() {
  const { courses, isLoading } = useCourses();
  const { grades } = useGrades();
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const { language, toggleLanguage, setLanguage } = useSettings();

  const { toggle, isDarkMode } = useDarkMode({
    defaultValue: false,
    localStorageKey: "pi-factor-theme",
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const options =
    Object.fromEntries(
      Object.entries(courses ?? {}).map((c) => [c[0], { ...c[1], id: c[0] }]),
    ) ?? null;
  const [selectedCourses, setSelectedCourses] = useState<AllTimeCourseInfo[]>(
    [],
  );

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

  useEffect(() => {
    const language = localStorage.getItem("language");
    if (language) {
      setLanguage(language as Language);
    } else {
      setLanguage("he");
      localStorage.setItem("language", "he");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

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

  const onSelectedOptions = (course: AllTimeCourseInfo) => {
    if (selectedCourses) {
      if (
        selectedCourses.some(
          (selectedCourse) => selectedCourse.id === course.id,
        )
      ) {
        setSelectedCourses(
          selectedCourses.filter(
            (selectedCourse) => selectedCourse.id !== course.id,
          ),
        );
        localStorage.setItem(
          "selectedCourses",
          JSON.stringify(
            selectedCourses.filter(
              (selectedCourse) => selectedCourse.id !== course.id,
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

  return (
    <main
      dir={dir(language)}
      className={
        "flex sm:overflow-hidden flex-col gap-4 p-4 items-center h-[100dvh] min-h-[100dvh] max-h-[100dvh] justify-between"
      }
    >
      <header className={"w-full flex flex-row justify-between items-center"}>
        <h1 className={"text-3xl font-black select-none"}>📊 Pi-Factor</h1>
        <section className={"flex flex-row gap-2"}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={"w-9 h-9 text-xl"}
                variant={"outline"}
                onClick={toggleLanguage}
              >
                🌍
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className={"flex flex-row gap-2 items-center"} dir={dir(language)}><span>🌍</span>{TRANSLATIONS[language].language}</DropdownMenuLabel>
              <DropdownMenuRadioGroup dir={dir(language)} value={language} onValueChange={setLanguage as (value: string) => void}>
                <DropdownMenuRadioItem value={"he"}>
                  עברית
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={"ar"}>
                  العربية
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={"en"}>
                  English
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className={"w-9 h-9"} variant={"outline"} onClick={toggle}>
            {isDarkMode ? (
              <LucideSun className={"text-amber-300"} size={24} />
            ) : (
              <LucideMoon className={"text-sky-800"} size={24} />
            )}
          </Button>
        </section>
      </header>
      <section
        dir={dir(language)}
        className={
          "flex sm:flex-row sm:overflow-y-hidden flex-col gap-4 w-full items-center h-full justify-between"
        }
      >
        {!isMobile && selectedCourses && selectedTab >= 0 && (
          <Sidebar {...{ selectedCourse, currentCourseGrades }} />
        )}
        <MainSection
          {...{
            grades,
            options,
            onSelectedOptions,
            isLoading,
            selectedCourses,
            setSelectedCourses,
            selectedTab,
            setSelectedTab,
            selectedCourse,
            currentCourseGrades,
          }}
        />
      </section>
    </main>
  );
}
