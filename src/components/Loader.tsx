import { Loader2 } from 'lucide-react';

export const AppLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-black/80">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
};
