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
            const formData = new FormData();

            formData.append("title", values.title);
            if (values.description) {
                formData.append("description", values.description);
            }
            formData.append("price", String(values.price));
            formData.append("image_file", values.images[0]);
            values.videos.forEach((videoFile) => {
                formData.append("video_files", videoFile);
            });

            const response = await fetch("/api/course/create", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to create course: ${response.statusText}`
                );
            }

            const result = await response.json();
            console.log(result);
            alert("Course created successfully!");
            form.reset();
        } catch (error) {
            console.error(error);
            alert("Error creating course.");
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
