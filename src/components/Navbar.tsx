import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Separator } from "./ui/separator";

const Navbar = async () => {
    const user = await currentUser();
    const email_address = user?.emailAddresses[0].emailAddress;
    const isAdmin =
        email_address && email_address === "mullagurithanuj0@gmail.com";

    return (
        <>
            <nav className="items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8 hidden sm:flex">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-800 transition-colors hover:text-gray-600"
                >
                    CrackTheCode
                </Link>
                <div className="flex items-center gap-x-4 md:gap-x-6">
                    {isAdmin && (
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
                    {!isAdmin && (
                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                            >
                                Dashboard
                            </Link>
                        </SignedIn>
                    )}
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
            <div className="sm:hidden flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-800 transition-colors hover:text-gray-600"
                >
                    CrackTheCode
                </Link>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="sm:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-4 pt-8">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Menu</SheetTitle>
                            <SheetDescription className="sr-only">
                                Main navigation menu for CrackTheCode.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-col gap-y-4">
                            {isAdmin && (
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
                            {!isAdmin && (
                                <SignedIn>
                                    <Link
                                        href="/dashboard"
                                        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                                    >
                                        Dashboard
                                    </Link>
                                </SignedIn>
                            )}
                            <Separator />
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full rounded-md bg-gray-800 px-4 py-1.5 text-left text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                        Login
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex items-center gap-x-2">
                                    <UserButton afterSignOutUrl="/" />
                                    <span>Profile</span>
                                </div>
                            </SignedIn>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
};

export default Navbar;
