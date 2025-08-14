import axios from "axios";
import * as cheerio from "cheerio";

function format_array_value(value: string, is_output = false): string {
    const trimmed_value = value.trim();

    try {
        const parsed = JSON.parse(trimmed_value);

        if (Array.isArray(parsed)) {
            if (parsed.length > 0 && Array.isArray(parsed[0])) {
                const rows = parsed.length;
                const cols = parsed[0]?.length || 0;
                const dimensions = `${rows} ${cols}`;
                const array_content = parsed
                    .map((inner_array) =>
                        Array.isArray(inner_array)
                            ? inner_array.join(" ")
                            : inner_array
                    )
                    .join("\n");

                if (is_output) {
                    return `${array_content}`;
                }

                return `${dimensions}\n${array_content}`;
            } else {
                const size = parsed.length;
                const array_content = parsed.join(" ");
                return `${size}\n${array_content}`;
            }
        }
    } catch (e) {}

    return trimmed_value.replace(/^"|"$/g, "");
}

function format_test_case_input(raw_inputs: string[]): string {
    return raw_inputs
        .map((inputStr) => {
            const value = inputStr.substring(inputStr.indexOf("=") + 1).trim();
            return format_array_value(value);
        })
        .join("\n");
}

export async function scrape_leetcode(problem_number: number) {
    try {
        const response = await axios.get(`/api/problem/${problem_number}`);
        const data = response.data;

        const title = data.title;
        const content_HTML = data.content;
        const $ = cheerio.load(content_HTML);

        interface TestCase {
            input: string;
            output: string;
        }

        const test_cases: TestCase[] = [];

        $("pre").each((_, el) => {
            const text = $(el).text();
            const input_match = text.match(/Input:\s*(.*)/);
            const output_match = text.match(/Output:\s*(.*)/);

            if (input_match?.[1] && output_match?.[1]) {
                const raw_inputs = input_match[1]
                    .trim()
                    .split(/,\s*(?=[a-zA-Z_])/)
                    .map((s) => s.trim());

                const final_input = format_test_case_input(raw_inputs);
                const final_output = format_array_value(output_match[1], true);

                test_cases.push({
                    input: final_input,
                    output: final_output,
                });
            }
        });

        let pending_input: string[] | null = null;
        $("p").each((_, el) => {
            const text = $(el).text().trim();
            const input_match = text.match(/Input:\s*(.*)/);
            const output_match = text.match(/Output:\s*(.*)/);

            if (input_match?.[1] && output_match?.[1]) {
                const raw_inputs = input_match[1]
                    .trim()
                    .split(/,\s*(?=[a-zA-Z_])/)
                    .map((s) => s.trim());

                const final_input = format_test_case_input(raw_inputs);
                const final_output = format_array_value(output_match[1], true);

                test_cases.push({ input: final_input, output: final_output });
                pending_input = null;
            } else if (input_match?.[1]) {
                pending_input = input_match[1]
                    .trim()
                    .split(/,\s*(?=[a-zA-Z_])/)
                    .map((s) => s.trim());
            } else if (output_match?.[1] && pending_input) {
                const final_input = format_test_case_input(pending_input);
                const final_output = format_array_value(output_match[1], true);

                test_cases.push({ input: final_input, output: final_output });
                pending_input = null;
            }
        });

        const final_test_cases = JSON.stringify(test_cases, null, 2);

        return { test_cases: final_test_cases, html: content_HTML, title };
    } catch (err) {
        console.error(`Error fetching problem ${problem_number}:`, err);
        throw err;
    }
}
