// In EnquiryPage.tsx
'use client';

import Base from '@/components/admin-page/enquiry/Base';
import { EnquirySidebar } from '@/components/admin-page/enquiry/EnquirySidebar';
import { View } from '@/types/view.types';
import { useState } from 'react';

const EnquiryPage = () => {
    const [view, setView] = useState<View>(View.BASE);

    return (
        <div className="flex w-screen bg-gray-100 h-full">
            <EnquirySidebar setView={setView} view={view} />
            <div className="flex-1 flex items-center justify-center">
                {(() => {
                    switch (view) {
                        case View.BASE:
                            return <Base />;
                    }
                })()}
            </div>
        </div>
    );
};

export default EnquiryPage;
