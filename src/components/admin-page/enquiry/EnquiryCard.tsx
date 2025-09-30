import { getCourseTitleById } from '@/actions/course.actions';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Enquiry, EnquiryStatus } from '@/generated/prisma';
import { useEffect, useState } from 'react';
import { FaArrowRight, FaUserMinus, FaUserPlus } from 'react-icons/fa6';

const EnquiryCard = ({
    enquiry,
    setStatusById,
}: {
    enquiry: Enquiry;
    setStatusById: (id: string, status: EnquiryStatus) => void;
}) => {
    const [courseName, setCourseName] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const response = await getCourseTitleById(enquiry.course_id);

            if (response.success) {
                setCourseName(response.title);
            }
        };

        fetchData();
    }, []);

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-base font-semibold">
                        {enquiry.first_name} {enquiry.last_name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                        {courseName}
                    </CardDescription>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {enquiry.status === EnquiryStatus.OPEN && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() =>
                                setStatusById(
                                    enquiry.id,
                                    EnquiryStatus.FOLLOWED_UP,
                                )
                            }
                        >
                            <FaArrowRight className="mr-1" /> Follow Up
                        </Button>
                    )}

                    {enquiry.status === EnquiryStatus.FOLLOWED_UP && (
                        <div className="flex flex-col">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() =>
                                    setStatusById(
                                        enquiry.id,
                                        EnquiryStatus.ENROLLED,
                                    )
                                }
                            >
                                <FaUserPlus className="mr-1" /> Enroll
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 mt-1 border-red-300 hover:bg-red-50"
                                onClick={() =>
                                    setStatusById(
                                        enquiry.id,
                                        EnquiryStatus.LOST,
                                    )
                                }
                            >
                                <FaUserMinus className="mr-1" /> Lost
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="text-sm text-gray-700">
                <p>{enquiry.note || 'Empty Note'}</p>
            </CardContent>

            <CardFooter className="text-xs text-gray-500">
                📍 {enquiry.location}
            </CardFooter>
        </Card>
    );
};

export default EnquiryCard;
