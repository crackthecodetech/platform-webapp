import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";

const AdminNavbar = async () => {
    const user = await currentUser();
    const email_address = user?.emailAddresses[0].emailAddress;

    return (
        <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8">
            <Link
                href="/"
                className="text-xl font-bold text-gray-800 transition-colors hover:text-gray-600"
            >
                CrackTheCode
            </Link>
            <div className="flex items-center gap-x-4 md:gap-x-6">
                {email_address &&
                    email_address === "mullagurithanuj0@gmail.com" && (
                        <Link
                            href="/admin"
                            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                        >
                            Admin Page
                        </Link>
                    )}
                <Link
                    href="/courses"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                    Courses
                </Link>
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

export default AdminNavbar;
