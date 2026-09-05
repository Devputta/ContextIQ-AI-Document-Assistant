import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
// API authentication is enforced by FastAPI with bearer tokens. Client routes use AuthProvider for UX gating.
export function middleware(_req:NextRequest){return NextResponse.next()}
export const config={matcher:[]};
