"use server";

import { scrape_leetcode } from "@/lib/leetcode";

export async function getLeetCodeProblem(problemNumber: number) {
    try {
        if (!problemNumber || isNaN(problemNumber)) {
            throw new Error("Invalid problem number.");
        }

        const problemData = await scrape_leetcode(problemNumber);

        if (!problemData) {
            throw new Error(
                `Could not find LeetCode problem #${problemNumber}.`
            );
        }

        return { success: true, data: problemData };
    } catch (error: any) {
        console.error("Error scraping LeetCode:", error);
        return { success: false, error: error.message };
    }
}
