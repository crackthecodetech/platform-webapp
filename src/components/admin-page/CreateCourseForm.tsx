"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "./FileUploader";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters." }),
    description: z.string().optional(),
    images: z.array(z.instanceof(File)).min(1, "Please upload an image."),
    price: z.coerce.number().min(0, "Price cannot be negative."),
    videos: z
        .array(z.instanceof(File))
        .min(1, "Please upload at least one video."),
});

type CourseFormValues = z.infer<typeof formSchema>;

export function CreateCourseForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [totalSize, setTotalSize] = useState(0);

    const resolver = zodResolver(formSchema) as Resolver<
        CourseFormValues,
        unknown
    >;

    const form = useForm<CourseFormValues>({
        resolver,
        defaultValues: {
            title: "",
            description: "",
            images: [],
            videos: [],
            price: 0,
        },
    });

    const { totalLoaded, totalProgressPercentage } = useMemo(() => {
        const loaded = Object.values(progress).reduce(
            (acc, val) => acc + val,
            0
        );
        const percentage = totalSize > 0 ? (loaded / totalSize) * 100 : 0;
        return { totalLoaded: loaded, totalProgressPercentage: percentage };
    }, [progress, totalSize]);

    async function onSubmit(values: CourseFormValues) {
        setIsLoading(true);
        setProgress({});

        try {
            const allFiles = [...values.images, ...values.videos];
            const totalBytes = allFiles.reduce(
                (acc, file) => acc + file.size,
                0
            );
            setTotalSize(totalBytes);

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;

            const uploadFile = async (file: File, folder: string) => {
                const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB chunks
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                const uniqueUploadId = `${file.name}-${Date.now()}`;
                let finalResult;

                for (let i = 0; i < totalChunks; i++) {
                    const start = i * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, file.size);
                    const chunk = file.slice(start, end);

                    const timestamp = Math.round(new Date().getTime() / 1000);
                    const paramsToSign = {
                        timestamp,
                        folder,
                    };
                    const signatureResponse = await fetch("/api/upload/sign", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paramsToSign }),
                    });
                    const { signature } = await signatureResponse.json();

                    const formData = new FormData();
                    formData.append("file", chunk);
                    formData.append("api_key", apiKey);
                    formData.append("timestamp", String(timestamp));
                    formData.append("signature", signature);
                    formData.append("folder", folder);

                    const response = await axios.post(
                        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                        formData,
                        {
                            headers: {
                                "X-Unique-Upload-Id": uniqueUploadId,
                                "Content-Range": `bytes ${start}-${end - 1}/${
                                    file.size
                                }`,
                            },
                            onUploadProgress: (progressEvent) => {
                                if (progressEvent.total) {
                                    const baseLoaded = start;
                                    const chunkLoaded = progressEvent.loaded;
                                    setProgress((prev) => ({
                                        ...prev,
                                        [file.name]: baseLoaded + chunkLoaded,
                                    }));
                                }
                            },
                        }
                    );

                    finalResult = response.data;
                }

                if (!finalResult) {
                    throw new Error("Upload failed to produce a result.");
                }

                return finalResult.secure_url;
            };

            const folderName = `courses/${values.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")}`;

            const uploadPromises = [
                uploadFile(values.images[0], folderName),
                ...values.videos.map((video) => uploadFile(video, folderName)),
            ];

            const uploadedUrls = await Promise.all(uploadPromises);
            const imageUrl = uploadedUrls[0];
            const videoUrls = uploadedUrls.slice(1);

            const courseData = {
                title: values.title,
                description: values.description,
                price: values.price,
                imageUrl: imageUrl,
                videoUrls: videoUrls,
            };

            const createCourseResponse = await fetch("/api/course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseData),
            });

            if (!createCourseResponse.ok) {
                throw new Error("Failed to create course record.");
            }

            alert("Course created successfully!");
            form.reset();
        } catch (error: any) {
            if (error.response) {
                console.error("Cloudinary Error:", error.response.data);
            } else {
                console.error("Error:", error.message);
            }
            alert(
                "An error occurred during course creation. Check the console for details."
            );
        } finally {
            setIsLoading(false);
            setProgress({});
            setTotalSize(0);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., 'Advanced Next.js'"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is the public title of your course.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us a little bit about the course"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (USD)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 19.99"
                                        step="0.01"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Image</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        multiple={false}
                                        accept={{ "image/*": [] }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="videos"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Videos</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        multiple={true}
                                        accept={{ "video/*": [] }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isLoading && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-center">
                                Uploading files...
                            </p>
                            <Progress
                                value={totalProgressPercentage}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                {`${(totalLoaded / 1024 / 1024).toFixed(
                                    2
                                )} MB / ${(totalSize / 1024 / 1024).toFixed(
                                    2
                                )} MB`}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoading ? "Uploading..." : "Create Course"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default CreateCourseForm;
