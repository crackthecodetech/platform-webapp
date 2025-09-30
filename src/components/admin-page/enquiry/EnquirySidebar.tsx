import { Button } from '@/components/ui/button';
import { View } from '@/types/view.types';
import { Dispatch, SetStateAction } from 'react';

export function EnquirySidebar({
    view,
    setView,
}: {
    view: View;
    setView: Dispatch<SetStateAction<View>>;
}) {
    const buttons: { label: string; viewType: View }[] = [
        {
            label: 'Overview',
            viewType: View.BASE,
        },
    ];

    return (
        <aside className="w-72 flex-shrink-0 border-r bg-gray-50 p-4 overflow-y-auto ">
            <h2 className="text-lg font-semibold mb-4">Navigation</h2>
            <nav className="space-y-2">
                <div className="space-y-1">
                    {buttons.map((btn) => (
                        <Button
                            key={btn.viewType}
                            onClick={() => setView(btn.viewType)}
                            variant={
                                view === btn.viewType ? 'default' : 'secondary'
                            }
                            className="w-full"
                        >
                            {btn.label}
                        </Button>
                    ))}
                </div>
            </nav>
        </aside>
    );
}
