import { create } from "zustand";
import { Language } from "@/lib/types";

interface SSemesters {
  matchesSearch: Record<string, boolean>;
  setMatchesSearch: (semester: string, match: boolean) => void;
}

export const useSemesters = create<SSemesters>((set) => ({
  matchesSearch: {},
  setMatchesSearch: (semester, match) =>
    set((state) => {
      state.matchesSearch[semester] = match;
      return { ...state };
    }),
}));

interface SCourseFilters {
  visibleMoeds: Record<string, boolean>;
  visibleGroups: Record<string, boolean>;
  setVisibility: (type: "moed" | "group", id: string, value: boolean) => void;
  setVisibleMoeds: (moeds: string[]) => void;
  clearGroups: () => void;
  clearMoeds: (courseId: string) => void;
  toggleMoed: (moed: string) => void;
}

export const useCourseFilters = create<SCourseFilters>((set) => ({
  visibleMoeds: {},
  visibleGroups: {},
  setVisibility: (type, id, value) =>
    set((state) => {
      if (type === "moed") {
        state.visibleMoeds[id] = value;
      } else {
        state.visibleGroups[id] = value;
      }
      return { ...state };
    }),
  setVisibleMoeds: (moeds) => {
    set((state) => {
      state.visibleMoeds = {};
      moeds.forEach((moed) => {
        state.visibleMoeds[moed] = true;
      });
      return { ...state };
    });
  },
  clearMoeds: (courseId) =>
    set((state) => {
      for (const key in state.visibleMoeds) {
        if (key.startsWith(courseId)) {
          delete state.visibleMoeds[key];
        }
      }
      return { ...state };
    }),
  toggleMoed: (moed: string) =>
    set((state) => {
      const newVisibleMoeds = { ...state.visibleMoeds };
      const semesterPrefix = moed.slice(0, -1);

      if (newVisibleMoeds[moed] === undefined) {
        newVisibleMoeds[moed] = false;
      }

      if (moed.endsWith("0")) {
        const isExclusiveMoedOn = newVisibleMoeds[moed];
        for (const key in newVisibleMoeds) {
          if (key.startsWith(semesterPrefix)) {
            newVisibleMoeds[key] = !isExclusiveMoedOn && key === moed;
          }
        }
      } else {
        const isMoedOn = newVisibleMoeds[moed];
        newVisibleMoeds[moed] = !isMoedOn;
        if (newVisibleMoeds[moed]) {
          newVisibleMoeds[semesterPrefix + "0"] = false;
        }
      }

      return { visibleMoeds: newVisibleMoeds };
    }),

  clearGroups: () =>
    set((state) => {
      state.visibleGroups = {};
      return { ...state };
    }),
}));

interface SSettings {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useSettings = create<SSettings>((set) => ({
  language: "he",
  setLanguage: (language) => set({ language }),
  toggleLanguage: () =>
    set((state) => {
      switch (state.language) {
        case "he":
          return { language: "ar" };
        case "ar":
          return { language: "en" };
        case "en":
          return { language: "he" };
      }
    }),
}));
