"use client";

import { useDropzone, Accept } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, GripVertical } from "lucide-react";
import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// A separate component for each sortable item in the list
function SortableFileItem({
    file,
    index,
    removeFile,
}: {
    file: File;
    index: number;
    removeFile: (index: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: file.name });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
        >
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab"
                >
                    <GripVertical className="h-5 w-5 text-gray-400" />
                </button>
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
    );
}

interface FileUploaderProps {
    value: File[];
    onChange: (files: File[]) => void;
    multiple?: boolean;
    accept?: Accept;
}

export function FileUploader({
    value = [],
    onChange,
    multiple = false,
    accept,
}: FileUploaderProps) {
    const onDrop = React.useCallback(
        (acceptedFiles: File[]) => {
            if (multiple) {
                onChange([...value, ...acceptedFiles]);
            } else {
                onChange(acceptedFiles);
            }
        },
        [onChange, value, multiple]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple,
    });

    const removeFile = (index: number) => {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onChange(newFiles);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = value.findIndex((file) => file.name === active.id);
            const newIndex = value.findIndex((file) => file.name === over.id);
            const reorderedFiles = arrayMove(value, oldIndex, newIndex);
            onChange(reorderedFiles);
        }
    }

    return (
        <div>
            <div
                {...getRootProps()}
                className={`w-full border-2 border-dashed rounded-lg p-10 text-center cursor-pointer ${
                    isDragActive
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-300"
                }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="w-12 h-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        {isDragActive
                            ? "Drop the files here ..."
                            : "Drag & drop files here, or click to select"}
                    </p>
                </div>
            </div>

            {value.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="mt-4 space-y-2">
                        <h3 className="font-semibold">
                            Selected Files (drag to reorder):
                        </h3>
                        <SortableContext
                            items={value.map((file) => file.name)}
                            strategy={verticalListSortingStrategy}
                        >
                            {value.map((file, index) => (
                                <SortableFileItem
                                    key={file.name}
                                    file={file}
                                    index={index}
                                    removeFile={removeFile}
                                />
                            ))}
                        </SortableContext>
                    </div>
                </DndContext>
            )}
        </div>
    );
}
