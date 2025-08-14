"use server";

const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";
const BASE_URL = `https://${JUDGE0_HOST}`;

type RunPayload = {
    code: string;
    languageId: number;
    testCases: string[];
};

type Judge0Result = {
    stdin: string;
    token?: string;
    status?: any;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    timedOut?: boolean;
    error?: string | null;
    raw?: any;
};

function toBase64(str: string) {
    return Buffer.from(str, "utf8").toString("base64");
}
function fromBase64(str?: string | null) {
    if (!str) return null;
    return Buffer.from(str, "base64").toString("utf8");
}

async function createSubmission(
    code: string,
    languageId: number,
    stdin: string
) {
    const body = {
        language_id: languageId,
        source_code: toBase64(code),
        stdin: toBase64(stdin),
    };

    const res = await fetch(
        `${BASE_URL}/submissions?base64_encoded=true&fields=*`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY ?? "",
                "X-RapidAPI-Host": JUDGE0_HOST,
            },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Judge0 create submission failed: ${txt}`);
    }

    return (await res.json()) as { token: string };
}

async function pollSubmission(token: string, maxAttempts = 20, delayMs = 1000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const res = await fetch(
            `${BASE_URL}/submissions/${token}?base64_encoded=true&fields=*`,
            {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY ?? "",
                    "X-RapidAPI-Host": JUDGE0_HOST,
                },
            }
        );
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Judge0 poll failed: ${txt}`);
        }
        const data = await res.json();
        if (data.status_id > 2) {
            return {
                token,
                status: data.status,
                stdout: fromBase64(data.stdout),
                stderr: fromBase64(data.stderr),
                compile_output: fromBase64(data.compile_output),
                message: data.message ?? null,
                raw: data,
            };
        }

        attempts++;
        await new Promise((r) => setTimeout(r, delayMs));
    }

    return { timedOut: true };
}

export async function runJudge0(payload: RunPayload): Promise<Judge0Result[]> {
    if (!process.env.RAPIDAPI_KEY) {
        throw new Error("Server missing RAPIDAPI_KEY environment variable");
    }

    const { code, languageId, testCases } = payload;
    if (!code || !languageId || !Array.isArray(testCases)) {
        throw new Error("Invalid payload for runJudge0");
    }

    const promises = testCases.map(async (stdin) => {
        try {
            const { token } = await createSubmission(code, languageId, stdin);
            const result = await pollSubmission(token, 30, 1000);
            return { stdin, ...result } as Judge0Result;
        } catch (err: any) {
            return {
                stdin,
                error: err?.message ?? "Unknown error",
            } as Judge0Result;
        }
    });

    const results = await Promise.all(promises);
    return results;
}
