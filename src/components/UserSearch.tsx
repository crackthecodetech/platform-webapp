"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { User } from "@/generated/prisma";
import { getUserByUsernameAndEmail } from "@/actions/user.actions";

interface UserSearchProps {
    onUserSelected: (user: User | null) => void;
}

export function UserSearch({ onUserSelected }: UserSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);
        setSearchResult(null);
        onUserSelected(null);

        try {
            const response = await getUserByUsernameAndEmail(searchQuery);
            if (!response.success) {
                throw new Error("User not found.");
            }
            console.log(response);
            const user = response.user;
            setSearchResult(user);
            onUserSelected(user);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    type="text"
                    id="user-search"
                    placeholder="Search by email, username, or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={isLoading}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? "Searching..." : "Search"}
                </Button>
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            {searchResult && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>{searchResult.username}</CardTitle>
                        <CardDescription>{searchResult.email}</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
