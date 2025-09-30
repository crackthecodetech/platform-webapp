'use server';

import prisma from '@/config/prisma.config';
import { EnquiryStatus } from '@/generated/prisma';

type CreateEnquiry = {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    course_id: string;
    note: string | null;
    location: string;
    college: string;
    graduation_year: number;
};

export const createEnquiry = async (data: CreateEnquiry) => {
    try {
        const enquiry = await prisma.enquiry.create({
            data: {
                ...data,
            },
        });

        return { success: true, enquiry };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export const getAllEnquiries = async () => {
    try {
        const enquiries = await prisma.enquiry.findMany();

        return { success: true, enquiries };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export const updateStatusByEnquiryId = async (
    id: string,
    status: EnquiryStatus,
) => {
    try {
        await prisma.enquiry.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
