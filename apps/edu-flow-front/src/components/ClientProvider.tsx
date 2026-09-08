'use client';

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from './ToastProvider';

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
    );
};
