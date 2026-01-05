// app/layout.tsx (RootLayout)
import type { Metadata } from "next";
import { Poppins } from 'next/font/google'
import "@flaticon/flaticon-uicons/css/all/all.css";
import "@flaticon/flaticon-uicons/css/brands/all.css";
import { AlertProvider } from "./context/AlertContext";
import "./globals.css";


const poppins = Poppins({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-poppins',
})

export const metadata: Metadata = {
    title: "Client Dashboard",
    description: "Client Dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={poppins.variable}>
            <body className={poppins.className} style={{ position: "relative", minHeight: "100vh" }}>
                <AlertProvider>   {children}</AlertProvider>
            </body>
        </html>
    );
}
