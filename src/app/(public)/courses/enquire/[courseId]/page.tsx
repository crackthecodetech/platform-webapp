import EnquiryForm from './EnquiryForm';

const EnquiryPage = async ({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) => {
    const { courseId } = await params;

    return <EnquiryForm courseId={courseId} />;
};

export default EnquiryPage;
