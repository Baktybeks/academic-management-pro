import { Suspense } from "react";
import LoginNotification from "@/components/LoginNotification";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginNotification />
    </Suspense>
  );
}
