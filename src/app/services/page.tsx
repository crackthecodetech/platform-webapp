"use client";

import React from "react";
import { MonitorPlay, Users, TerminalSquare } from "lucide-react";

export default function ServicesPage() {
    return (
        <section id="services" className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800">
                    Our Services
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                    We offer a flexible range of services to fit your learning
                    style and needs.
                </p>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm">
                        <MonitorPlay className="h-12 w-12 text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold">
                            Online Coaching
                        </h3>
                        <p className="mt-2 text-gray-600">
                            Live interactive online classes and self-paced video
                            courses.
                        </p>
                    </div>
                    <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm">
                        <Users className="h-12 w-12 text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold">
                            Offline Coaching
                        </h3>
                        <p className="mt-2 text-gray-600">
                            In-person bootcamps and workshops for hands-on
                            learning.
                        </p>
                    </div>
                    <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm">
                        <TerminalSquare className="h-12 w-12 text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold">
                            Online Compiler
                        </h3>
                        <p className="mt-2 text-gray-600">
                            Practice and run your code instantly on our
                            integrated online compiler.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
