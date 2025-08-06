"use client";

import { useDropzone, Accept } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import React from "react";

interface FileUploaderProps {
    value: File[];
    onChange: (files: File[]) => void;
    multiple?: boolean;
    accept?: Accept;
}

export function FileUploader({
    value = [],
    onChange,
    accept,
}: FileUploaderProps) {
    const onDrop = React.useCallback(
        (acceptedFiles: File[]) => {
            onChange(acceptedFiles);
        },
        [onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
    });

    const removeFile = (indexToRemove: number) => {
        const newFiles = value.filter((_, index) => index !== indexToRemove);
        onChange(newFiles);
    };

    return (
        <div>
            <div
                {...getRootProps()}
                className={`w-full border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                    isDragActive
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-gray-400"
                }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="w-12 h-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        {isDragActive
                            ? "Drop the file here..."
                            : `Drag & drop a file here, or click to select`}
                    </p>
                </div>
            </div>
            {value.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">Selected File(s):</h3>
                    {value.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                        >
                            <div className="flex items-center gap-2">
                                <FileIcon className="h-5 w-5 text-gray-500" />
                                <span className="text-sm">{file.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 text-red-500 hover:text-red-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
