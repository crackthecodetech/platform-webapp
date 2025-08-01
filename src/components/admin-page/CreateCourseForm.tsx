"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";

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
            price: 0.0,
        },
    });

    async function onSubmit(values: CourseFormValues) {
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;

            const folderName = `courses/${values.title
                .replace(/\s+/g, "-")
                .toLowerCase()}`;

            const uploadFile = async (file: File, folder: string) => {
                const timestamp = Math.round(new Date().getTime() / 1000);

                const paramsToSign = { timestamp, folder };

                const signatureResponse = await fetch("/api/upload/sign", {
                    method: "POST",
                    body: JSON.stringify({ paramsToSign }),
                });
                const { signature } = await signatureResponse.json();

                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", apiKey);
                formData.append("timestamp", String(timestamp));
                formData.append("signature", signature);
                formData.append("folder", folder);

                const uploadResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!uploadResponse.ok) {
                    throw new Error("Cloudinary upload failed.");
                }
                const uploadResult = await uploadResponse.json();
                return uploadResult.secure_url;
            };

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

            const createCourseResponse = await fetch("/api/course/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseData),
            });

            if (!createCourseResponse.ok) {
                throw new Error("Failed to create course record.");
            }

            alert("Course created successfully!");
            form.reset();
        } catch (error) {
            console.error(error);
            alert("An error occurred during course creation.");
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
                                <FormLabel>Price (INR)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.10"
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
                    <Button type="submit">Create Course</Button>
                </form>
            </Form>
        </div>
    );
}

export default CreateCourseForm;
