"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <main className="bg-white">
            <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
                <div className="flex flex-col items-center justify-around px-6 py-24 text-center lg:flex-row lg:py-32 lg:text-left w-full">
                    <div className="w-full lg:w-1/2 lg:pr-12">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl text-balance">
                            Master the Code, Shape Your Future.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 lg:mx-0 mx-auto">
                            Unlock your potential with our programming courses
                            designed to take you from beginner to job-ready
                            professional. Learn with hands-on projects and
                            expert mentorship.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                            <Link href="/courses">
                                <Button
                                    size="lg"
                                    className="transition-transform duration-300 hover:scale-105"
                                >
                                    Explore Courses
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="transition-transform duration-300 hover:scale-105"
                                >
                                    Why Us?
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative mt-16 w-full max-w-lg sm:mt-20 lg:mt-0 lg:w-1/2">
                        <div className="absolute -right-20 -top-20 w-full h-full bg-sky-200/30 rounded-full blur-3xl -z-10" />
                        <div className="absolute -left-20 bottom-0 w-full h-full bg-blue-200/20 rounded-full blur-3xl -z-10" />
                        <Image
                            src="/homepage-hero.svg"
                            alt="Illustration of a person coding on a laptop"
                            width={600}
                            height={400}
                            className="h-auto w-full"
                            priority
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}
