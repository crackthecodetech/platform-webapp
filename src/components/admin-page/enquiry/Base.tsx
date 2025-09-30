'use client';

import { Enquiry, EnquiryStatus } from '@/generated/prisma';
import EnquiryCard from './EnquiryCard';
import { useEffect, useState } from 'react';
import {
    getAllEnquiries,
    updateStatusByEnquiryId,
} from '@/actions/enquiry.actions';

const Base = () => {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getAllEnquiries();

            if (response.success) {
                setEnquiries(response.enquiries);
            }
        };

        fetchData();
    }, []);

    const openedEnquiries = enquiries.filter(
        (enquiry) => enquiry.status === EnquiryStatus.OPEN,
    );
    const followedUpEnquiries = enquiries.filter(
        (enquiry) => enquiry.status === EnquiryStatus.FOLLOWED_UP,
    );
    const enrolledEnquiries = enquiries.filter(
        (enquiry) => enquiry.status === EnquiryStatus.ENROLLED,
    );
    const lostEnquiries = enquiries.filter(
        (enquiry) => enquiry.status === EnquiryStatus.LOST,
    );

    const columns = [
        { title: 'Opened', color: 'text-blue-600', data: openedEnquiries },
        {
            title: 'Followed Up',
            color: 'text-yellow-600',
            data: followedUpEnquiries,
        },
        { title: 'Enrolled', color: 'text-green-600', data: enrolledEnquiries },
        { title: 'Lost', color: 'text-red-600', data: lostEnquiries },
    ];

    async function setStatusById(id: string, status: EnquiryStatus) {
        const response = await updateStatusByEnquiryId(id, status);

        if (response.success) {
            setEnquiries((prev) =>
                prev.map((enquiry) =>
                    enquiry.id === id ? { ...enquiry, status } : enquiry,
                ),
            );
        }
    }

    return (
        <main className="h-[600px] w-full p-4 flex flex-col">
            <div className="min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full h-[600px]">
                    {columns.map((col) => (
                        <div
                            key={col.title}
                            className="bg-white rounded-lg shadow flex flex-col h-[600px]"
                        >
                            <div className="p-4 border-b border-gray-200">
                                <h2
                                    className={`text-lg font-semibold ${col.color}`}
                                >
                                    {col.title}
                                </h2>
                            </div>
                            {/* Scrollable area */}
                            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                <div className="flex flex-col gap-3">
                                    {col.data.map((enquiry) => (
                                        <EnquiryCard
                                            key={enquiry.id}
                                            enquiry={enquiry}
                                            setStatusById={setStatusById}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Base;
