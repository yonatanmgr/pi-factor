import {createDBClient} from "@/lib/utils/supabase/client";
import { type NextRequest } from 'next/server'

const supabase = createDBClient();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const course_code = searchParams.get('course_code') ?? '';
    const course_code_with_dash = course_code.slice(0, 4) + '-' + course_code.slice(4);

    const { data: courses_course, error } = await supabase
        .from('courses_course')
        .select('*')
        .eq('course_code', course_code_with_dash);
    if (error) {
        return new Response('Internal Server Error', { status: 500 });
    }
    return new Response(JSON.stringify(courses_course), { status: 200 });
}