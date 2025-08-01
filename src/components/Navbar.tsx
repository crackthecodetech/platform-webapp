import { SignedOut, SignInButton } from "@clerk/nextjs";
import React from "react";

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8">
            <div className="text-xl font-semibold text-gray-800">
                CrackTheCode
            </div>
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="rounded-md bg-gray-800 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                        Login
                    </button>
                </SignInButton>
            </SignedOut>
        </nav>
    );
};

export default Navbar;
