// src/hooks/useAuth.ts

import { useAuthStore } from "@/store/authStore";
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from "@/services/authService";
import { UserRole } from "@/types";
import { useEffect } from "react";

export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore();

  // React Query хуки
  const {
    data: currentUser,
    isLoading: isCheckingAuth,
    error: authError,
  } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  // Синхронизируем состояние Zustand с React Query
  useEffect(() => {
    if (currentUser && !("notActivated" in currentUser)) {
      setUser(currentUser);
    } else {
      clearUser();
    }
  }, [currentUser, setUser, clearUser]);

  // Функции для компонентов
  const login = async (email: string, password: string) => {
    try {
      const user = await loginMutation.mutateAsync({ email, password });
      setUser(user);
      return user;
    } catch (error) {
      clearUser();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      clearUser();
    } catch (error) {
      // Даже если запрос не удался, очищаем локальное состояние
      clearUser();
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    return registerMutation.mutateAsync({ name, email, password, role });
  };

  const clearError = () => {
    // Можно добавить логику очистки ошибок если нужно
  };

  return {
    // Состояние
    user,
    loading:
      isCheckingAuth ||
      loginMutation.isPending ||
      logoutMutation.isPending ||
      registerMutation.isPending,
    error:
      authError?.message ||
      loginMutation.error?.message ||
      logoutMutation.error?.message ||
      registerMutation.error?.message ||
      null,

    // Действия
    login,
    logout,
    register,
    clearError,

    // Статусы мутаций
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
