<<<<<<< HEAD
import './globals.css'; import type {Metadata} from 'next'; import {AuthProvider} from '@/components/auth-provider';
export const metadata:Metadata={title:'ContextIQ — AI Document Assistant',description:'Upload, retrieve, ask and cite with grounded document AI.',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><body><AuthProvider>{children}</AuthProvider></body></html>}
=======
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ContextIQ — AI Document Assistant",
  description: "Understand your documents with context-aware AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
