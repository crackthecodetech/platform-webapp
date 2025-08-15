import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Separator } from "./ui/separator";
import NavLinks from "./NavLinks";

type NavLink = {
    href: string;
    label: string;
    show: boolean;
};

const Navbar = async () => {
    const { sessionClaims } = await auth();
    const isSignedIn = sessionClaims !== null;
    const isAdmin = isSignedIn && sessionClaims["metadata"]["role"] === "admin";

    const navLinksConfig: NavLink[] = [
        {
            href: "/admin/create-course",
            label: "New Course",
            show: isAdmin,
        },
        {
            href: "/admin/course-analytics",
            label: "Course Analytics",
            show: isAdmin,
        },
        {
            href: "/courses",
            label: "Courses",
            show: isSignedIn,
        },
        {
            href: "/dashboard",
            label: "Dashboard",
            show: isSignedIn && !isAdmin,
        },
        {
            href: "/",
            label: "Home",
            show: !isSignedIn,
        },
        {
            href: "/about",
            label: "About Us",
            show: !isSignedIn,
        },
        {
            href: "/services",
            label: "Services",
            show: !isSignedIn,
        },
        {
            href: "/courses",
            label: "All Courses",
            show: !isSignedIn,
        },
        {
            href: "/contact",
            label: "Contact Us",
            show: !isSignedIn,
        },
    ];

    return (
        <>
            <nav className="sticky top-0 hidden items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:flex md:px-8">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-800 hover:text-gray-600"
                >
                    CrackTheCode
                </Link>
                <div className="flex items-center gap-x-4 md:gap-x-6">
                    <NavLinks links={navLinksConfig} />
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="rounded-md bg-gray-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
                                Login
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </nav>
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 sm:hidden">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-800 hover:text-gray-600"
                >
                    CrackTheCode
                </Link>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-4 pt-8">
                        <SheetTitle>Navigation</SheetTitle>
                        <div className="flex flex-col gap-y-4">
                            <NavLinks links={navLinksConfig} />
                            <Separator />
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full rounded-md bg-gray-800 px-4 py-1.5 text-left text-sm font-medium text-white hover:bg-gray-700">
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
