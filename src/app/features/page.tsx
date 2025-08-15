"use client";

import React from "react";
import { Zap, BookOpen, ShieldCheck } from "lucide-react";

export default function FeaturesPage() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800">
                    Why Choose Us?
                </h2>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm">
                        <Zap className="h-12 w-12 text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold">
                            Interactive Learning
                        </h3>
                        <p className="mt-2 text-gray-600">
                            Engage with hands-on projects and real-world
                            scenarios.
                        </p>
                    </div>
                    <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm">
                        <BookOpen className="h-12 w-12 text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold">
                            Expert-Led Courses
                        </h3>
                        <p className="mt-2 text-gray-600">
                            Learn from industry professionals with proven
                            experience.
                        </p>
                    </div>
                    <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm">
                        <ShieldCheck className="h-12 w-12 text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold">
                            Lifetime Access
                        </h3>
                        <p className="mt-2 text-gray-600">
                            Enroll once and get lifetime access to course
                            materials.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
