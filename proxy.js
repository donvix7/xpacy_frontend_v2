import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;


  // Handle email verification redirection (from proxy.js)
  if(pathname === "/auth/verify-email"){
      const userToken = request.nextUrl.searchParams.get("token")
      if(userToken) return NextResponse.redirect(new URL("/auth/verify-success", request.url))
  }

  // Protect Property Owner Dashboard
  if (pathname.startsWith('/dashboard/property-owner')) {
    if (!token) {
      const loginUrl = new URL('/property-owner/log-in', request.url);
      loginUrl.searchParams.set('redirectUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin Dashboard
  if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/admin')) {
      // Exclude login page to avoid loop
      if (!pathname.startsWith('/admin/log-in')) {
          if (!token) {
              const loginUrl = new URL('/admin/log-in', request.url);
              // loginUrl.searchParams.set('redirectUrl', pathname); // standard admin login usually doesn't need redirect param if handled by dashboard redirect logic, but good to have.
              return NextResponse.redirect(loginUrl);
          }
      }
  }

  // Protect User Dashboard (General)
  if (pathname.startsWith('/dashboard/user')) {
    if (!token) {
        const loginUrl = new URL('/auth/log-in', request.url);
        loginUrl.searchParams.set('redirectUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }
  }
  
  // Invoice protection (from proxy.js matcher /invoice/:invoiceId)
  if (pathname.startsWith('/invoice/')) {
       // Logic from proxy.js implied protection or just matching. Assuming protection if it was there.
       // However, proxy.js didn't have specific logic for invoice other than matcher. 
       // If it was just to ensure token presence:
       if (!token) {
           return NextResponse.redirect(new URL("/auth/log-in", request.url));
       }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
      '/dashboard/:path*', 
      '/auth/verify-email', 
      '/invoice/:invoiceId*', 
      // '/book-service', // proxy.js had this, adding it back if needed for protection
      '/admin/:path*'
  ],
};