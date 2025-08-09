import { Button } from "@/components/ui/button";
import { BookOpen, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";

const HomePage = () => {
    return (
        <div className="flex flex-col bg-white px-8 py-4">
            <main className="flex-grow">
                <section className="container mx-auto flex flex-col items-center px-6 py-16 text-center lg:flex-row lg:py-24 lg:text-left">
                    <Suspense fallback={<div>Loading...</div>}>
                        <div className="w-full lg:w-1/2 lg:pr-12">
                            <h1 className="text-4xl font-bold leading-tight text-gray-800 sm:text-5xl md:text-6xl">
                                Master the Code, Shape Your Future.
                            </h1>
                            <p className="mt-4 text-lg text-gray-600">
                                Unlock your potential with our programming
                                courses designed to take you from beginner to
                                job-ready professional.
                            </p>
                            <div className="mt-8 flex justify-center gap-4 lg:justify-start">
                                <Link href={"/courses"}>
                                    <Button className="transform rounded-lg h-full bg-gray-800 px-8 py-3 font-semibold text-lg text-white shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                                        Explore Courses
                                    </Button>
                                </Link>
                                <Link href="#features">
                                    <Button
                                        variant="outline"
                                        className="transform rounded-lg h-full border border-gray-300 px-8 py-3 font-semibold text-lg text-gray-700 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Suspense>
                    <Suspense fallback={<div>Loading...</div>}>
                        <div className="mt-12 w-full max-w-lg lg:mt-0 lg:w-1/2">
                            <Image
                                src="/homepage-hero.svg"
                                alt="Illustration of a person coding on a laptop"
                                className="h-auto w-full"
                                width={10}
                                height={10}
                                fetchPriority="high"
                            />
                        </div>
                    </Suspense>
                </section>
                <section id="features" className="bg-gray-50 py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Why Choose CrackTheCode?
                        </h2>
                        <div className="mt-12 grid gap-8 md:grid-cols-3">
                            <div className="flex flex-col items-center">
                                <Zap className="h-12 w-12 text-gray-700" />
                                <h3 className="mt-4 text-xl font-semibold">
                                    Interactive Learning
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Engage with hands-on projects and real-world
                                    scenarios.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <BookOpen className="h-12 w-12 text-gray-700" />
                                <h3 className="mt-4 text-xl font-semibold">
                                    Expert-Led Courses
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Learn from industry professionals with
                                    proven experience.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <ShieldCheck className="h-12 w-12 text-gray-700" />
                                <h3 className="mt-4 text-xl font-semibold">
                                    Lifetime Access
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Enroll once and get lifetime access to
                                    course materials.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Suspense fallback={<div>Loading...</div>}>
                <footer className="bg-gray-50">
                    <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} CrackTheCode. All
                        Rights Reserved.
                    </div>
                </footer>
            </Suspense>
        </div>
    );
};

export default HomePage;
