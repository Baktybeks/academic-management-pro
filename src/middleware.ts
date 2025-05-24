// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get("auth-storage");
  let user = null;

  if (authSession) {
    try {
      const parsed = JSON.parse(authSession.value);
      user = parsed.state?.user;
    } catch (error) {
      console.error("Ошибка при разборе auth-session:", error);
    }
  }

  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;

  // Публичные страницы - логин и регистрация
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      return redirectByRole(user.role, request);
    }
    return NextResponse.next();
  }

  // Если пользователь не авторизован или не активирован
  if (!isAuthenticated || !isActive) {
    const loginUrl = new URL(request.nextUrl.origin);
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Защита маршрутов по ролям

  // СуперАдмин - доступ ко всем маршрутам /super-admin
  if (path.startsWith("/super-admin") && user.role !== UserRole.SUPER_ADMIN) {
    return redirectByRole(user.role, request);
  }

  // Академсоветник - доступ к маршрутам /academic-advisor
  if (
    path.startsWith("/academic-advisor") &&
    user.role !== UserRole.ACADEMIC_ADVISOR
  ) {
    return redirectByRole(user.role, request);
  }

  // Преподаватель - доступ к маршрутам /teacher
  if (path.startsWith("/teacher") && user.role !== UserRole.TEACHER) {
    return redirectByRole(user.role, request);
  }

  // Студент - доступ к маршрутам /student
  if (path.startsWith("/student") && user.role !== UserRole.STUDENT) {
    return redirectByRole(user.role, request);
  }

  // Перенаправление с главной страницы
  if (path === "/") {
    return redirectByRole(user.role, request);
  }

  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let path: string;

  switch (role) {
    case UserRole.SUPER_ADMIN:
      path = "/super-admin";
      break;
    case UserRole.ACADEMIC_ADVISOR:
      path = "/academic-advisor";
      break;
    case UserRole.TEACHER:
      path = "/teacher";
      break;
    case UserRole.STUDENT:
      path = "/student";
      break;
    default:
      path = "/login";
  }

  const url = new URL(request.nextUrl.origin);
  url.pathname = path;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico).*)",
    "/super-admin/:path*",
    "/academic-advisor/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
    "/register",
    "/",
  ],
};
