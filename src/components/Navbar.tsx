import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8">
            <Link
                href="/"
                className="text-xl font-bold text-gray-800 transition-colors hover:text-gray-600"
            >
                CrackTheCode
            </Link>
            <div className="flex items-center gap-x-4 md:gap-x-6">
                <Link
                    href="/courses"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                    Courses
                </Link>
                <SignedIn>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                        Dashboard
                    </Link>
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="rounded-md bg-gray-800 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                            Login
                        </button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
            </div>
        </nav>
    );
};

export default Navbar;
