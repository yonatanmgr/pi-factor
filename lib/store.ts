import { create } from "zustand";

interface SCourseFilters {
  visibleMoeds: Record<string, boolean>;
  visibleGroups: Record<string, boolean>;
  setVisibility: (type: "moed" | "group", id: string, value: boolean) => void;
    setVisibleMoeds: (moeds: string[]) => void;
    clearGroups: () => void;
    clearMoeds: () => void;
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
    clearMoeds: () =>
    set((state) => {
      state.visibleMoeds = {};
      return { ...state };
    }),
    clearGroups: () =>
    set((state) => {
      state.visibleGroups = {};
      return { ...state };
    }),
}));
