'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { runJudge0 } from '@/actions/judge0.actions';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TestCase {
    stdin: string;
    expected_output: string;
}

interface TestResult extends TestCase {
    status: 'pending' | 'running' | 'passed' | 'failed' | 'completed';
    actual_output?: string;
    stderr?: string;
    compile_output?: string;
}

interface CodeEditorProps {
    initialCode?: string;
    testCases?: TestCase[];
    code_title: string;
    custom_input?: boolean;
}

const languageMap: Record<string, { id: number; monaco: string }> = {
    java: { id: 62, monaco: 'java' },
    javascript: { id: 63, monaco: 'javascript' },
    python: { id: 71, monaco: 'python' },
    'c++': { id: 54, monaco: 'cpp' },
};

const boilerplateMap: Record<string, string> = {
    java: `// Must be a public class named Main
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
    javascript: `// Use console.log to print output
function main() {
    console.log('Hello from JavaScript!');
}

main();`,
    python: `# Use print to write to stdout
def main():
    print("Hello from Python!")

if __name__ == "__main__":
    main()`,
    'c++': `#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}`,
};

const CodeEditor: React.FC<CodeEditorProps> = ({
    initialCode,
    testCases: initialTestCases = [],
    code_title,
    custom_input = false,
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState('java');
    const [code, setCode] = useState(
        initialCode || boilerplateMap[selectedLanguage],
    );
    const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
    const [results, setResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    // State for custom input mode
    const [customStdin, setCustomStdin] = useState('');
    const [runOutput, setRunOutput] = useState('');

    // State for adding a new test case (only in non-custom mode)
    const [newStdin, setNewStdin] = useState('');
    const [newExpectedOutput, setNewExpectedOutput] = useState('');

    const handleEditorWillMount = (monaco: any) => {
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
        });
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    };

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage);
        setCode(boilerplateMap[newLanguage]);
        setHasRun(false);
        setResults([]);
        setRunOutput(''); // Reset custom output
    };

    const handleAddTestCase = () => {
        if (newStdin.trim() && newExpectedOutput.trim()) {
            setTestCases([
                ...testCases,
                { stdin: newStdin, expected_output: newExpectedOutput },
            ]);
            setNewStdin('');
            setNewExpectedOutput('');
        }
    };

    const handleRunCode = async () => {
        setIsLoading(true);
        setHasRun(true);

        try {
            const languageId = languageMap[selectedLanguage].id;

            if (custom_input) {
                setRunOutput('Running...');
                const apiResults = await runJudge0({
                    code,
                    languageId,
                    testCases: [customStdin],
                });

                const result = apiResults[0];
                if (result) {
                    const output =
                        result.stdout?.trim() ||
                        result.stderr?.trim() ||
                        result.compile_output?.trim() ||
                        (result.timedOut ? 'Timed out' : 'No output');
                    setRunOutput(output);
                } else {
                    setRunOutput('Error: API did not return a result.');
                }
            } else {
                // Logic for test-case mode
                setResults(
                    testCases.map((tc) => ({ ...tc, status: 'running' })),
                );
                const inputs = testCases.map((t) => t.stdin);
                const apiResults = await runJudge0({
                    code,
                    languageId,
                    testCases: inputs,
                });

                if (testCases.length === 0) {
                    const result = apiResults[0];
                    if (result) {
                        const actualOutput =
                            result.stdout?.trim() ||
                            result.stderr?.trim() ||
                            result.compile_output?.trim() ||
                            (result.timedOut ? 'Timed out' : 'No output');
                        const finalResult = {
                            stdin: 'No Input',
                            expected_output: '',
                            status: 'completed',
                            actual_output: actualOutput,
                            stderr: result.stderr,
                            compile_output: result.compile_output,
                        };
                        setResults([finalResult as TestResult]);
                    } else {
                        setResults([]);
                    }
                } else {
                    const finalResults = testCases.map((tc, index) => {
                        const result = apiResults[index];
                        const actualOutput =
                            result.stdout?.trim() ||
                            result.stderr?.trim() ||
                            result.compile_output?.trim() ||
                            (result.timedOut ? 'Timed out' : 'No output');
                        const isCorrect =
                            actualOutput === tc.expected_output.trim() &&
                            !result.stderr &&
                            !result.compile_output;
                        return {
                            ...tc,
                            status: isCorrect ? 'passed' : 'failed',
                            actual_output: actualOutput,
                            stderr: result.stderr,
                            compile_output: result.compile_output,
                        } as TestResult;
                    });
                    setResults(finalResults);
                }
            }
        } catch (err: any) {
            const errorMsg = err?.message ?? 'An error occurred';
            toast(errorMsg);
            if (custom_input) setRunOutput(errorMsg);
            else setResults([]);
            setHasRun(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>

            <h1 className="text-2xl font-bold px-4 py-2">{code_title}</h1>
            <div className="flex-grow">
                <Editor
                    height="60vh"
                    language={languageMap[selectedLanguage].monaco}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value ?? '')}
                    beforeMount={handleEditorWillMount}
                    options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        wordWrap: 'on',
                    }}
                />
            </div>
            <div className="flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-900 border-t flex flex-wrap items-center justify-between gap-4">
                <Select
                    value={selectedLanguage}
                    onValueChange={handleLanguageChange}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(languageMap).map((language) => (
                            <SelectItem value={language} key={language}>
                                {language.charAt(0).toUpperCase() +
                                    language.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleRunCode}
                    disabled={isLoading}
                    className="w-full sm:w-32"
                >
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? 'Running...' : 'Run Code'}
                </Button>
            </div>

            {/* == Conditional Rendering for Input/Output Area == */}
            {custom_input ? (
                // CUSTOM INPUT MODE
                <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 border-t space-y-4">
                    <div>
                        <Label htmlFor="custom_stdin">
                            Custom Input (stdin)
                        </Label>
                        <Textarea
                            id="custom_stdin"
                            value={customStdin}
                            onChange={(e) => setCustomStdin(e.target.value)}
                            placeholder="Enter your custom input here..."
                            className="mt-1 font-mono bg-white dark:bg-black"
                            rows={5}
                            disabled={isLoading}
                        />
                    </div>
                    {hasRun && (
                        <div className="animate-fade-in">
                            <Label htmlFor="run_output">Output</Label>
                            <Textarea
                                id="run_output"
                                value={runOutput}
                                readOnly
                                placeholder="Execution output will appear here..."
                                className="mt-1 font-mono bg-white dark:bg-black"
                                rows={8}
                            />
                        </div>
                    )}
                </div>
            ) : (
                // TEST CASE MODE
                <>
                    <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="stdin">
                                    Standard Input (stdin)
                                </Label>
                                <Textarea
                                    id="stdin"
                                    value={newStdin}
                                    onChange={(e) =>
                                        setNewStdin(e.target.value)
                                    }
                                    placeholder="Enter input for the test case"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="expected_output">
                                    Expected Output
                                </Label>
                                <Textarea
                                    id="expected_output"
                                    value={newExpectedOutput}
                                    onChange={(e) =>
                                        setNewExpectedOutput(e.target.value)
                                    }
                                    placeholder="Enter the expected output"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <Button onClick={handleAddTestCase} className="mt-4">
                            Add Test Case
                        </Button>
                    </div>

                    <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 border-t min-h-[25vh] overflow-y-auto">
                        <h3 className="font-semibold mb-2">
                            {hasRun ? 'Results' : 'Test Cases'}:
                        </h3>
                        <div className="space-y-4">
                            {(hasRun ? results : testCases).map(
                                (item, index) => {
                                    const resultItem = item as TestResult;
                                    const isPassed =
                                        resultItem.status === 'passed';
                                    const isFailed =
                                        resultItem.status === 'failed';
                                    const isRunning =
                                        resultItem.status === 'running';

                                    const bgColor = isPassed
                                        ? 'bg-green-100 dark:bg-green-900/50'
                                        : isFailed
                                          ? 'bg-red-100 dark:bg-red-900/50'
                                          : 'bg-gray-100 dark:bg-gray-700/50';
                                    const borderColor = isPassed
                                        ? 'border-green-500'
                                        : isFailed
                                          ? 'border-red-500'
                                          : isRunning
                                            ? 'border-yellow-500 animate-pulse'
                                            : 'border-transparent';

                                    return (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-md border-l-4 transition-colors duration-300 animate-fade-in ${bgColor} ${borderColor}`}
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                            }}
                                        >
                                            <p className="font-semibold text-sm flex items-center gap-2">
                                                {isPassed && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                )}
                                                {isFailed && (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                                {isRunning && (
                                                    <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                                                )}
                                                Test Case {index + 1}
                                                {hasRun && (
                                                    <span className="font-normal capitalize text-xs">
                                                        {' '}
                                                        ({resultItem.status})
                                                    </span>
                                                )}
                                            </p>
                                            <div className="mt-2 pl-1 text-xs space-y-2">
                                                <div className="whitespace-pre-wrap">
                                                    <strong>Input:</strong>{' '}
                                                    <br /> {item.stdin}
                                                </div>
                                                <div className="whitespace-pre-wrap">
                                                    <strong>Expected:</strong>{' '}
                                                    <br />{' '}
                                                    {item.expected_output}
                                                </div>
                                                {(isPassed || isFailed) && (
                                                    <>
                                                        <div className="whitespace-pre-wrap">
                                                            <strong>
                                                                Output:
                                                            </strong>{' '}
                                                            <br />
                                                            {
                                                                resultItem.actual_output
                                                            }
                                                        </div>
                                                        {resultItem.stderr && (
                                                            <pre className="text-red-500 whitespace-pre-wrap">
                                                                <strong>
                                                                    Stderr:
                                                                </strong>
                                                                <br />
                                                                {
                                                                    resultItem.stderr
                                                                }
                                                            </pre>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CodeEditor;
