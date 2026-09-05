import './globals.css'; import type {Metadata} from 'next'; import {AuthProvider} from '@/components/auth-provider';
export const metadata:Metadata={title:'ContextIQ — AI Document Assistant',description:'Upload, retrieve, ask and cite with grounded document AI.',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><body><AuthProvider>{children}</AuthProvider></body></html>}
