'use client';
import { toast } from 'sonner';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { createEnquiry } from '@/actions/enquiry.actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string(),
    email: z.string(),
    location: z.string().min(1),
    college: z.string().min(1),
    graduationYear: z.coerce.number().min(2025),
    note: z.string().optional(),
});

export default function EnquiryForm({ courseId }: { courseId: string }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as Resolver<
            z.infer<typeof formSchema>
        >,
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            location: '',
            college: '',
            graduationYear: 2026,
            note: '',
        },
    });
    const router = useRouter();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const {
                firstName,
                lastName,
                phone,
                email,
                location,
                college,
                graduationYear,
                note,
            } = values;

            const response = await createEnquiry({
                first_name: firstName,
                last_name: lastName,
                phone,
                email,
                location,
                college,
                graduation_year: graduationYear,
                note,
                course_id: courseId,
            });

            if (!response.success) {
                throw response.error;
            }

            toast.success(
                'Enquiry submitted. We will reach out to you as soon as possible. Thank you for your interest.',
            );

            router.push('/courses');
        } catch (error) {
            console.error('Form submission error', error);
            toast.error('Failed to submit the form. Please try again.');
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 max-w-3xl mx-auto py-10"
            >
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="John"
                                    type="text"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Doe"
                                    type="text"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                            <FormLabel>Phone number</FormLabel>
                            <FormControl className="w-full">
                                <PhoneInput
                                    placeholder="xxxxxxxxxx"
                                    {...field}
                                    defaultCountry="TR"
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="john.doe@gmail.com"
                                    type="email"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="L.B. Nagar"
                                    type="text"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="college"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>College</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="JNTUH"
                                    type="text"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Graduation Year</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="2026"
                                    type="number"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Note (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter what you want to enquire about"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
