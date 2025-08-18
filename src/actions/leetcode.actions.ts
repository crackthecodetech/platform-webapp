"use server";

import axios from "axios";
import * as cheerio from "cheerio";

interface JudgeTestCase {
    stdin: string;
    expected_output: string;
}

interface GraphQLResponse {
    data: {
        question: {
            title: string;
            content: string;
            exampleTestcaseList: string[];
            metaData: string;
        };
    };
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

function formatValueForJudge(rawValue: string, isOutput = false): string {
    const trimmed = rawValue.trim();

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        if (trimmed.includes("#")) {
            return trimmed.substring(1, trimmed.length - 1).replace(/,/g, " ");
        }

        try {
            const parsedArray = JSON.parse(trimmed);

            if (Array.isArray(parsedArray[0])) {
                const rows = parsedArray.length;
                const cols = parsedArray[0]?.length || 0;
                const matrixContent = parsedArray
                    .map((row: any[]) => row.join(" "))
                    .join("\n");

                if (isOutput) {
                    return matrixContent;
                }
                return `${rows} ${cols}\n${matrixContent}`;
            }

            const content = parsedArray
                .map((item: any) => (item === null ? "null" : item))
                .join(" ");

            if (isOutput) {
                return content;
            }

            return `${parsedArray.length}\n${content}`;
        } catch (e) {
            console.error(e);
            return trimmed;
        }
    }

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.substring(1, trimmed.length - 1);
    }
    return trimmed;
}

export async function scrape_leetcode(problem_number: number) {
    try {
        const response = await axios.get(
            `${process.env.LEETCODE_BASE_URL}/${problem_number}`
        );
        const data = response.data;
        const title = data.title as string;
        const formattedTitle = title.toLowerCase().replace(/\s+/g, "-");

        return { title: slugify(formattedTitle) };
    } catch (err) {
        console.error(`Error fetching problem ${problem_number}:`, err);
        throw err;
    }
}

export async function getLeetCodeProblem(problem_number: number) {
    const { title: titleSlug } = await scrape_leetcode(problem_number);

    const headers = {
        "Content-Type": "application/json",
        Cookie: `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}; csrftoken=${process.env.CSRF_TOKEN};`,
        "x-csrftoken": process.env.CSRF_TOKEN,
        Referer: `https://leetcode.com/problems/${titleSlug}/`,
    };

    const payload = {
        query: `
            query questionData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    title
                    content
                    exampleTestcaseList
                    metaData
                }
            }
        `,
        variables: {
            titleSlug: titleSlug,
        },
    };

    try {
        const response = await axios.post<GraphQLResponse>(
            process.env.LEETCODE_API_ENDPOINT,
            payload,
            { headers }
        );
        const questionData = response.data.data.question;

        if (!questionData) {
            throw new Error(
                `Problem with title slug "${titleSlug}" not found.`
            );
        }

        const title = questionData.title;
        const contentHTML = questionData.content;

        const rawInputsList = questionData.exampleTestcaseList;

        const $ = cheerio.load(contentHTML);
        const rawOutputsList: string[] = [];

        const textNodes = $("body")
            .find("*")
            .contents()
            .filter(function () {
                return this.type === "text";
            });

        textNodes.each((_, node) => {
            const text = $(node).text().trim();
            if (text.startsWith("[") && text.endsWith("]")) {
                const prev = $(node).prev();
                if (
                    prev.is("strong") &&
                    prev.text().trim().startsWith("Output")
                ) {
                    rawOutputsList.push(text);
                }
                const parentPrev = $(node).parent().prev();
                if (
                    parentPrev.is("strong") &&
                    parentPrev.text().trim().startsWith("Output")
                ) {
                    rawOutputsList.push(text);
                }
            }
        });

        if (rawInputsList.length > 0 && rawOutputsList.length === 0) {
            $("strong").each((_, el) => {
                const strongElement = $(el);
                const strongText = strongElement.text().trim();
                if (strongText.startsWith("Output:")) {
                    const parentNode = strongElement.parent().get(0);
                    if (!parentNode) return;
                    const outputBlockText = $(parentNode).text();
                    const outputMatch =
                        outputBlockText.match(/Output:\s*([\s\S]*)/);
                    if (outputMatch && outputMatch[1]) {
                        const fullOutput = outputMatch[1].trim();
                        const outputValue = fullOutput.split("\n")[0].trim();
                        rawOutputsList.push(outputValue);
                    }
                }
            });
        }

        if (rawInputsList.length !== rawOutputsList.length) {
            console.error(
                `Input count: ${rawInputsList.length}, Output count: ${rawOutputsList.length}`
            );
            console.error("Inputs:", rawInputsList);
            console.error("Outputs:", rawOutputsList);
            throw new Error(
                "Mismatch between the number of inputs from API and outputs parsed from HTML."
            );
        }

        const judgeTestCases: JudgeTestCase[] = rawInputsList.map(
            (rawInputs, index) => {
                const currentRawOutput = rawOutputsList[index];
                const inputLines = rawInputs.trim().split("\n");

                const stdin = inputLines
                    .map((line) => formatValueForJudge(line, false))
                    .join("\n");
                const expected_output = formatValueForJudge(
                    currentRawOutput,
                    true
                );

                return { stdin, expected_output };
            }
        );

        return {
            title,
            html: contentHTML,
            test_cases: JSON.stringify(judgeTestCases, null, 2),
        };
    } catch (err) {
        console.error(`Error fetching problem "${titleSlug}":`, err);
        if (axios.isAxiosError(err) && err.response) {
            console.error("Response Data:", err.response.data);
        }
        throw err;
    }
}
