import Navbar from "@/components/Navbar";
import Image from "next/image";
import React from "react";

const HomePage = () => {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <main className="flex-grow">
                <section className="container mx-auto flex flex-col items-center px-6 py-16 text-center lg:flex-row lg:py-24 lg:text-left">
                    <div className="w-full lg:w-1/2 lg:pr-12">
                        <h1 className="text-4xl font-bold leading-tight text-gray-800 sm:text-5xl md:text-6xl">
                            Master the Code, Shape Your Future.
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Unlock your potential with our programming courses
                            designed to take you from beginner to job-ready
                            professional.
                        </p>
                        <div className="mt-8 flex justify-center gap-4 lg:justify-start">
                            <button className="transform rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                                Explore Courses
                            </button>
                            <button className="transform rounded-lg border border-gray-300 px-8 py-3 font-semibold text-gray-700 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                                Learn More
                            </button>
                        </div>
                    </div>
                    <div className="mt-12 w-full max-w-lg lg:mt-0 lg:w-1/2">
                        <Image
                            src="/homepage-hero.svg"
                            alt="Illustration of a person coding on a laptop"
                            className="h-auto w-full"
                            width={10}
                            height={10}
                        />
                    </div>
                </section>
            </main>
            <footer className="bg-gray-50">
                <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} CrackTheCode. All Rights
                    Reserved.
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
