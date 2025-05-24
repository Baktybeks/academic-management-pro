// components/LoginNotification.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginNotification() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get("registered");
    const activated = searchParams.get("activated");
    const activation = searchParams.get("activation");

    if (registered === "true") {
      if (activated === "true") {
        toast.success(
          "🎉 Регистрация завершена! Аккаунт активирован, можете войти в систему.",
          {
            position: "top-center",
            autoClose: 6000,
          }
        );
      } else if (activation === "pending") {
        toast.info(
          "⏳ Регистрация завершена! Ваш аккаунт ожидает активации администратором.",
          {
            position: "top-center",
            autoClose: 8000,
          }
        );
      } else {
        toast.success("✅ Регистрация завершена успешно!", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  }, [searchParams]);

  return null;
}
