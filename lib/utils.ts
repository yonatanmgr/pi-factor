import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ms from "ms";
import { Language } from "@/lib/types";

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return "never";
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? "" : " ago"
  }`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dir = (lang: Language) => {
  return lang !== "en" ? "rtl" : "ltr";
};

export const getMoedsList = (lang: Language) => {
  return {
    he: ["מועד קובע", "מועד א'", "מועד ב'", "מועד ג'"],
    en: ["Decisive Ex.", "Date A", "Date B", "Date C"],
    ar: ["الموعد الحاسم", "الموعد أ", "الموعد ب", "الموعد ج"],
  }[lang];
};

export const getSemesterName = (semester: string, lang: Language) => {
  return {
    he: `${semester.replace("a", " א'").replace("b", " ב'")}`,
    en: `${semester.replace("a", " A").replace("b", " B")}`,
    ar: `${semester.replace("a", " أ").replace("b", " ب")}`,
  }[lang];
};

export const getAllGroups = (group: string, lang: Language) => {
  if (group == "00") {
    return {
      he: "כל הקבוצות",
      en: "All Groups",
      ar: "كل المجموعات",
    }[lang];
  } else return null;
};

export const last = <T>(arr: T[] | undefined): T | null => {
  if (arr && arr.length > 0) return arr[arr.length - 1];
  return null;
};

export const first = <T>(arr: T[] | undefined): T | null => {
  if (arr && arr.length > 0) return arr[0];
  return null;
};
