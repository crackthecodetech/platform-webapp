"use client";

import React from "react";

export default function ContactPage() {
    return (
        <section id="contact" className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800">
                    Get In Touch
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                    Have questions? We'd love to hear from you.
                </p>
                <div className="mt-8 p-8 border rounded-lg max-w-md mx-auto bg-gray-50">
                    <div className="space-y-4 text-left text-gray-700">
                        <p className="flex items-center">
                            <strong className="w-24">Name:</strong> Dimbu
                            Keshava Reddy
                        </p>
                        <p className="flex items-center">
                            <strong className="w-24">Email:</strong>{" "}
                            <a
                                href="mailto:crackthecode.tech@gmail.com"
                                className="text-blue-600 hover:underline"
                            >
                                crackthecode.tech@gmail.com
                            </a>
                        </p>
                        <p className="flex items-center">
                            <strong className="w-24">Phone:</strong>{" "}
                            <a
                                href="tel:+919182518264"
                                className="text-blue-600 hover:underline"
                            >
                                +91 91825 18264
                            </a>
                        </p>
                        <p className="flex items-start">
                            <strong className="w-24 flex-shrink-0">
                                Address:
                            </strong>{" "}
                            <span>Hyderabad, Telangana, 501510, India</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
