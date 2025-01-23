import useSWR, { SWRConfiguration } from "swr";
import { AllTimeCourses, AllTimeGrades } from "@/lib/types";

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return response.json();
};

const SWRConfig: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function useCourses() {
  const { data, error, isLoading } = useSWR<AllTimeCourses>(
    "https://arazim-project.com/data/courses.json",
    fetcher,
    SWRConfig,
  );

  return {
    courses: data,
    error,
    isLoading,
  };
}

function useGrades() {
  const { data, error, isLoading } = useSWR<AllTimeGrades>(
    "https://arazim-project.com/data/grades.json",
    fetcher,
    SWRConfig,
  );

  return {
    grades: data,
    error,
    isLoading,
  };
}

export { useCourses, useGrades };
