import { createDBClient } from "@/lib/utils/supabase/client";
import { type NextRequest } from "next/server";

const supabase = createDBClient();

interface InputData {
    year: number;
    semester: string;
    course_group_name: string;
    moed: number;
    lowest_grade: number;
    highest_grade: number;
    students_in_range: number;
    teachers: string;
    average_mean: number;
}

interface OutputData {
    semester: string;
    course_groups: {
        [course_group_name: string]: {
            [moed: number]: number[];
        };
    };
    teachers: string;
    average_mean: number;
}

function transformData(input: InputData[]): OutputData[] {
    const groupedBySemester: { [semester: string]: InputData[] } = {};

    input.forEach(item => {
        const semesterKey = `${item.year}${item.semester}`;
        if (!groupedBySemester[semesterKey]) {
            groupedBySemester[semesterKey] = [];
        }
        groupedBySemester[semesterKey].push(item);
    });

    const output: OutputData[] = [];

    for (const semesterKey in groupedBySemester) {
        const semesterGroup = groupedBySemester[semesterKey];
        const courseGroups: { [course_group_name: string]: { [moed: number]: number[] } } = {};
        let teachers: string | undefined = undefined; // Store teachers (take from first entry)
        let average_mean: number | undefined = undefined; // Store average mean (take from first entry)

        // Group by course_group_name within the semester
        const groupedByCourse: { [course_group_name: string]: InputData[] } = {};
        semesterGroup.forEach(item => {
            if (!groupedByCourse[item.course_group_name]) {
                groupedByCourse[item.course_group_name] = [];
            }
            groupedByCourse[item.course_group_name].push(item);
        });

        for (const courseGroupName in groupedByCourse) {
            const courseGroup = groupedByCourse[courseGroupName];
            const distributions: { [moed: number]: number[] } = {};

            const moedGroups = new Map<number, InputData[]>();
            courseGroup.forEach(item => {
                if (!moedGroups.has(item.moed)) {
                    moedGroups.set(item.moed, []);
                }
                moedGroups.get(item.moed)!.push(item);
            });

            moedGroups.forEach((moedGroup, moed) => {
                const sortedMoedGroup = [...moedGroup].sort((a, b) => a.lowest_grade - b.lowest_grade);
                distributions[moed] = sortedMoedGroup.map(item => item.students_in_range);
            });

            courseGroups[courseGroupName] = distributions;

            // Take teachers and average_mean from the first entry of ANY course group (they should be the same for all)
            if (teachers === undefined) {
                teachers = courseGroup[0].teachers;
                average_mean = courseGroup[0].average_mean;
            }
        }

        const firstEntrySemester = semesterGroup[0]; // For the semester string
        output.push({
            semester: `${firstEntrySemester.year}${firstEntrySemester.semester}`,
            course_groups: courseGroups,
            teachers: teachers!,  // Non-null assertion (we assigned it above)
            average_mean: average_mean!, // Non-null assertion
        });
    }

    return output;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const course_code = searchParams.get("course_code") ?? "";
  const course_code_with_dash =
    course_code.slice(0, 4) + "-" + course_code.slice(4);


    const { data, error } = await supabase
        // @ts-ignore
        .rpc('get_grades_data', {
            course_code_param: course_code_with_dash
        })

    const transformedData = transformData(data as unknown as InputData[]);


  if (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
  return new Response(JSON.stringify(transformedData), { status: 200 });
}
