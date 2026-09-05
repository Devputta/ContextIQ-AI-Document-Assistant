<<<<<<< HEAD
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
// API authentication is enforced by FastAPI with bearer tokens. Client routes use AuthProvider for UX gating.
export function middleware(_req:NextRequest){return NextResponse.next()}
export const config={matcher:[]};
=======
import {NextRequest,NextResponse} from "next/server";
export function middleware(req:NextRequest){const protectedPath=["/dashboard","/documents","/chat-history","/settings"].some(p=>req.nextUrl.pathname===p||req.nextUrl.pathname.startsWith(p+"/"));if(!protectedPath)return NextResponse.next();if(!req.cookies.has("contextiq_session")){const u=req.nextUrl.clone();u.pathname="/auth/login";u.searchParams.set("next",req.nextUrl.pathname);return NextResponse.redirect(u)}return NextResponse.next()}
export const config={matcher:["/dashboard/:path*","/documents/:path*","/chat-history/:path*","/settings/:path*"]};
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
