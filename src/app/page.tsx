"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import { containerVariants } from "@/lib/variants";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <AnimatedSection
            className="container mx-auto flex flex-col items-center px-6 py-16 text-center lg:flex-row lg:py-24 lg:text-left"
            variants={containerVariants}
            amount={0.25}
        >
            <div className="w-full lg:w-1/2 lg:pr-12">
                <h1 className="text-4xl font-bold leading-tight text-gray-800 sm:text-5xl md:text-6xl">
                    Master the Code, Shape Your Future.
                </h1>

                <p className="mt-4 text-lg text-gray-600">
                    Unlock your potential with our programming courses designed
                    to take you from beginner to job-ready professional.
                </p>

                <div className="mt-8 flex justify-center gap-4 lg:justify-start">
                    <Link href={"/courses"}>
                        <Button className="transform rounded-lg h-full bg-gray-800 px-8 py-3 font-semibold text-lg text-white shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            Explore Courses
                        </Button>
                    </Link>

                    <Link href="/features">
                        <Button
                            variant="outline"
                            className="transform rounded-lg h-full border border-gray-300 px-8 py-3 font-semibold text-lg text-gray-700 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            Why Us
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mt-12 w-full max-w-lg lg:mt-0 lg:w-1/2">
                <div className="overflow-hidden rounded-lg">
                    <Image
                        src="/homepage-hero.svg"
                        alt="Illustration of a person coding on a laptop"
                        className="h-auto w-full"
                        width={600}
                        height={400}
                        priority
                    />
                </div>
            </div>
        </AnimatedSection>
    );
}
