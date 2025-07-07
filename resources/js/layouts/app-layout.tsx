import { PropsWithChildren } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from 'sonner';

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background py-6">{children}</main>
            <Footer />
            <Toaster position="top-right" richColors />
        </div>
    );
}
