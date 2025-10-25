import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  //   const res = NextResponse.next();

  //   // 🔹 Permitir o callback do Supabase passar sem bloqueio
  //   if (req.nextUrl.pathname.startsWith("/auth/v1/callback")) {
  //     return res;
  //   }

  //   const supabase = createServerClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //     { cookies: req.cookies }
  //   );

  //   const { data } = await supabase.auth.getUser();
  //   const isAuthenticated = !!data.user;

  //   if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
  //     return NextResponse.redirect(new URL("/", req.url));
  //   }

  //   return res;

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
