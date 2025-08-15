"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { runJudge0 } from "@/actions/judge0.actions";
import { toast } from "sonner";

interface TestCase {
    input: string;
    output: string;
}

interface CodeEditorProps {
    initialCode?: string;
    testCases: TestCase[];
    code_title: string;
}

const languageMap: Record<string, { id: number; monaco: string }> = {
    javascript: { id: 63, monaco: "javascript" },
    python: { id: 71, monaco: "python" },
    "c++": { id: 54, monaco: "cpp" },
};

const CodeEditor: React.FC<CodeEditorProps> = ({
    initialCode = "",
    testCases,
    code_title,
}) => {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");

    const handleRunCode = async () => {
        setIsLoading(true);
        setOutput([]);

        try {
            const languageId = languageMap[selectedLanguage].id;
            const inputs = testCases.map((t) => t.input);

            const results = await runJudge0({
                code,
                languageId,
                testCases: inputs,
            });

            setOutput(results);
        } catch (err: any) {
            console.error("runJudge0 error:", err);
            toast(err?.message ?? "An error occurred while running the code");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold px-4 py-2">{code_title}</h1>
            <div className="flex-grow">
                <Editor
                    height="80vh"
                    language={languageMap[selectedLanguage].monaco}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value ?? "")}
                    options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        fixedOverflowWidgets: true,
                        fontWeight: "bold",
                        autoSurround: "languageDefined",
                        cursorStyle: "block",
                        cursorBlinking: "solid",
                        cursorSmoothCaretAnimation: "on",
                        cursorSurroundingLines: 5,
                        cursorSurroundingLinesStyle: "all",
                        contextmenu: false,
                        formatOnType: true,
                        smoothScrolling: true,
                        wordWrap: "on",
                        selectOnLineNumbers: true,
                        mouseWheelZoom: true,
                    }}
                />
            </div>
            <div className="flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-900 border-t flex items-center justify-between">
                <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="c++">C++</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleRunCode} disabled={isLoading}>
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? "Running..." : "Run Code"}
                </Button>
            </div>
            {output.length > 0 && (
                <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 border-t ">
                    <h3 className="font-semibold mb-2">Results:</h3>
                    <div className="space-y-4">
                        {output.map((result, index) => {
                            const expectedOutput =
                                testCases[index]?.output?.trim() ?? "";
                            const actualOutput =
                                (result.stdout && result.stdout.trim()) ||
                                (result.stderr && result.stderr.trim()) ||
                                (result.compile_output &&
                                    result.compile_output.trim()) ||
                                (result.timedOut ? "Timed out" : "No output");

                            const isCorrect = actualOutput === expectedOutput;

                            return (
                                <div
                                    key={index}
                                    className={`p-3 rounded-md ${
                                        isCorrect
                                            ? "bg-green-100 dark:bg-green-900"
                                            : "bg-red-100 dark:bg-red-900"
                                    }`}
                                >
                                    <p className="font-semibold text-sm">
                                        Test Case {index + 1}:{" "}
                                        {isCorrect ? "Passed" : "Failed"}
                                    </p>
                                    <p className="text-xs mt-1">
                                        <strong>Input:</strong> {result.stdin}
                                    </p>
                                    <p className="text-xs mt-1">
                                        <strong>Expected:</strong>{" "}
                                        {expectedOutput || "<empty>"}
                                    </p>
                                    <p className="text-xs mt-1">
                                        <strong>Output:</strong> {actualOutput}
                                    </p>
                                    {result.compile_output && (
                                        <pre className="text-xs mt-2 whitespace-pre-wrap">
                                            <strong>Compile output:</strong>
                                            {"\n"}
                                            {result.compile_output}
                                        </pre>
                                    )}
                                    {result.stderr && (
                                        <pre className="text-xs mt-2 whitespace-pre-wrap">
                                            <strong>Stderr:</strong>
                                            {"\n"}
                                            {result.stderr}
                                        </pre>
                                    )}
                                    {result.error && (
                                        <p className="text-xs mt-2 text-yellow-600">
                                            <strong>Error:</strong>{" "}
                                            {result.error}
                                        </p>
                                    )}
                                    {result.timedOut && (
                                        <p className="text-xs mt-2 text-yellow-600">
                                            Timed out waiting for judge
                                            response.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
