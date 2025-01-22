import useSWR from "swr";
import {AllTimeCourses} from "@/lib/types";

const fetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error('An error occurred while fetching the data.')
    }
    return response.json()
}

function useCourses () {
    const { data, error, isLoading } = useSWR<AllTimeCourses>("https://arazim-project.com/data/courses.json", fetcher)

    return {
        courses: data,
        error,
        isLoading,
    }
}

export {useCourses};