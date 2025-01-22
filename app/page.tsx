"use client";
import React, {useState} from 'react'
import {useCourses} from "@/lib/api";
import VirtualizedList from "@/components/ui/list";
import {AllTimeCourseInfo} from "@/lib/types";
import {Button} from "@/components/ui/button";
import {LucideX} from "lucide-react";
import {cn} from "@/lib/utils";

export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

// const Previous = () => {
//     return <>
//         <Link
//             href="https://vercel.com/templates/next.js/postgres-starter"
//             className="group mt-20 sm:mt-0 rounded-full flex space-x-1 bg-white/30 shadow-sm ring-1 ring-gray-900/5 text-gray-600 text-sm font-medium px-10 py-2 hover:shadow-lg active:shadow-sm transition-all"
//         >
//             <p>Something something</p>
//             <ExpandingArrow/>
//         </Link>
//         <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
//             Postgres on Vercel
//         </h1>
//         <Suspense fallback={<TablePlaceholder/>}>
//             <Table/>
//         </Suspense>
//         <p className="font-light text-gray-600 w-full max-w-lg text-center mt-6">
//             <Link
//                 href="https://vercel.com/postgres"
//                 className="font-medium underline underline-offset-4 hover:text-black transition-colors"
//             >
//                 Vercel Postgres
//             </Link>{' '}
//             demo. <br/> Built with{' '}
//             <Link
//                 href="https://nextjs.org/docs"
//                 className="font-medium underline underline-offset-4 hover:text-black transition-colors"
//             >
//                 Next.js App Router
//             </Link>
//             .
//         </p>
//
//         <div
//             className="flex justify-center space-x-5 pt-10 mt-10 border-t border-gray-300 w-full max-w-xl text-gray-600">
//             <Link
//                 href="https://postgres-prisma.vercel.app/"
//                 className="font-medium underline underline-offset-4 hover:text-black transition-colors"
//             >
//                 Prisma
//             </Link>
//             <Link
//                 href="https://postgres-kysely.vercel.app/"
//                 className="font-medium underline underline-offset-4 hover:text-black transition-colors"
//             >
//                 Kysely
//             </Link>
//             <Link
//                 href="https://postgres-drizzle.vercel.app/"
//                 className="font-medium underline underline-offset-4 hover:text-black transition-colors"
//             >
//                 Drizzle
//             </Link>
//         </div>
//
//         <div className="sm:absolute sm:bottom-0 w-full px-20 py-10 flex justify-between">
//             <Link href="https://vercel.com">
//                 <Image
//                     src="/vercel.svg"
//                     alt="Vercel Logo"
//                     width={100}
//                     height={24}
//                     priority
//                 />
//             </Link>
//             <Link
//                 href="https://github.com/vercel/examples/tree/main/storage/postgres-starter"
//                 className="flex items-center space-x-2"
//             >
//                 <Image
//                     src="/github.svg"
//                     alt="GitHub Logo"
//                     width={24}
//                     height={24}
//                     priority
//                 />
//                 <p className="font-light">Source</p>
//             </Link>
//         </div>
//     </>
// }

export default function Home() {
    const {courses, isLoading} = useCourses();
    const options = Object.fromEntries(Object.entries(courses ?? {}).map(c => ([c[0], {...c[1], id: c[0]}]))) ?? null;
    const [selectedCourses, setSelectedCourses] = useState<AllTimeCourseInfo[] | null>(null);
    const [selectedTab, setSelectedTab] = useState<number | null>(null);

    const onSelectedOptions = (course: AllTimeCourseInfo) => {
        if (selectedCourses) {
            if (selectedCourses.some((selectedCourse) => selectedCourse.name === course.name)) {
                setSelectedCourses(selectedCourses.filter((selectedCourse) => selectedCourse.name !== course.name));
            } else {
                setSelectedCourses([...selectedCourses, course])
            }
        } else {
            setSelectedCourses([course])
        }
    }

    return (
        <main dir={"rtl"}
              className={"flex text-zinc-800 flex-col gap-4 p-4 items-center h-screen min-h-screen justify-between"}>
            <header className={"w-full flex flex-row items-stretch"}>
                <h1 className={"text-3xl font-black"}>
                    📊 Pi-Factor
                </h1>
            </header>
            <section dir={"rtl"} className={"flex sm:flex-row flex-col gap-4 w-full items-center h-full justify-between"}>
                <section className={"min-h-full h-full p-2 sm:w-1/4 w-full min-w-[300px] rounded-lg bg-zinc-100 border"}>
                    <div className={"flex flex-col gap-2"}>
                        <VirtualizedList options={options ?? {}} isLoading={isLoading}
                                         selectedOptions={selectedCourses ?? []} onSelectedOption={onSelectedOptions}/>

                        <Button className={"bg-zinc-50 border"} variant={"secondary"}
                                disabled={!selectedCourses?.length} onClick={() => setSelectedCourses(null)}>נקה
                            בחירה</Button>
                    </div>
                </section>
                <section className={"min-h-full flex flex-col gap-2 p-3 h-full sm:w-3/4 w-full rounded-lg bg-zinc-100 border"}>
                    <header className={"flex flex-row gap-2 flex-wrap min-h-10"}>
                        {!selectedCourses?.length && (
                            <span className={"w-full h-9 mr-1 text-zinc-400 select-none flex flex-row items-center"}>קורסים נבחרים יופיעו כאן...</span>
                        )}
                        {selectedCourses?.map((course) => (
                            <Button key={course.name}
                                    className={cn("bg-zinc-50 border", selectedTab !== null && selectedTab == selectedCourses.indexOf(course) && "bg-zinc-800 text-zinc-50 hover:bg-zinc-900")}
                                    variant={"secondary"}
                                    onClick={() => setSelectedTab(selectedTab == selectedCourses.indexOf(course) ? null : selectedCourses.indexOf(course))}>
                                <span>
                                        {course?.name}
                                </span>|
                                <span className={"opacity-80 font-light"}>{course.id}</span>

                                <span className={"h-4 w-4 flex flex-row items-center justify-center"} onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedCourses(selectedCourses.filter((selectedCourse) => selectedCourse.name !== course.name));
                                    if (selectedTab !== null && selectedTab == selectedCourses.indexOf(course)) {
                                        setSelectedTab(null)
                                    } else {
                                        setSelectedTab(selectedCourses.indexOf(selectedCourses[selectedTab ?? 0]) - 1)
                                    }
                                }}>
                                    <LucideX size={14}/>
                                </span>
                            </Button>
                        ))}
                    </header>
                    <section className={"grow rounded-md w-full bg-zinc-50 border"}>
                        {!selectedCourses?.length && (
                            <div
                                className={"w-full h-full text-lg text-zinc-400 select-none flex flex-row items-center justify-center"}>
                                הוסיפו קורסים מהרשימה בצד שמאל...
                            </div>
                        )}
                        {selectedCourses && selectedTab !== null && (<></>)}
                        {selectedCourses && selectedTab === null && (
                            <div
                                className={"w-full h-full text-lg text-zinc-400 select-none flex flex-row items-center justify-center"}>
                                סמנו קורס מלמעלה כדי לראות את התפלגות הציונים שלו...
                            </div>
                        )}
                    </section>
                </section>
            </section>
        </main>
    )
}
