import { NextResponse } from "next/server";
import { auth, isAllowedEmail } from "@/auth";

export default auth((request) => {
  if (!isAllowedEmail(request.auth?.user?.email)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|brand.png).*)"],
};
