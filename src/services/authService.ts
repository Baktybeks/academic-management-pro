// src/services/authService.ts

import { appwriteConfig } from "@/constants/appwriteConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, Account, ID, Databases, Query } from "appwrite";
import { User, UserRole } from "@/types";
import { toast } from "react-toastify";

const {
  projectId: PROJECT_ID,
  endpoint: ENDPOINT,
  databaseId: DATABASE_ID,
  collections,
} = appwriteConfig;

export type GetUserResult = User | { notActivated: true } | null;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const account = new Account(client);
const database = new Databases(client);

export const authApi = {
  getCurrentUser: async (): Promise<User | null | { notActivated: true }> => {
    try {
      console.log("Получаем текущую сессию пользователя...");
      let session;
      try {
        session = await account.get();
      } catch (err: any) {
        if (err.code === 401) {
          console.log("Пользователь не авторизован (гость)");
          return null;
        }
        throw err;
      }

      if (!session) {
        console.log("Сессия не найдена");
        return null;
      }

      const users = await database.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal("email", session.email)]
      );

      if (users.documents.length === 0) {
        console.log("Информация о пользователе не найдена в базе данных");
        return null;
      }

      const userData = users.documents[0];
      if (!userData.isActive && userData.role !== UserRole.SUPER_ADMIN) {
        console.log("Пользователь не активирован");
        return { notActivated: true };
      }

      console.log("Пользователь найден:", userData.name);
      return userData as unknown as User;
    } catch (error) {
      console.error("Ошибка при получении текущего пользователя:", error);
      return null;
    }
  },
  register: async (
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ): Promise<User> => {
    try {
      console.log(`Регистрация пользователя: ${email}...`);
      const adminCheck = await database.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal("role", UserRole.SUPER_ADMIN)]
      );
      const finalRole =
        adminCheck.total === 0
          ? UserRole.SUPER_ADMIN
          : role || UserRole.TEACHER;

      // Создаем пользователя в Appwrite Auth
      const authUser = await account.create(ID.unique(), email, password, name);

      // Создаем документ пользователя в базе данных
      const userData = {
        name,
        email,
        role: finalRole,
        isActive: finalRole === UserRole.SUPER_ADMIN ? true : false, // СуперАдмины автоматически активированы
        createdAt: new Date().toISOString(),
      };

      const user = await database.createDocument(
        DATABASE_ID,
        collections.users,
        authUser.$id, // Используем ID из Auth как ID документа
        userData
      );

      console.log("Пользователь успешно зарегистрирован:", user.$id);
      if (finalRole === UserRole.SUPER_ADMIN) {
        console.log(
          "Пользователь назначен СуперАдминистратором (первый пользователь в системе)"
        );
      }
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при регистрации пользователя:", error);
      throw error;
    }
  },

  // Вход в систему
  login: async (email: string, password: string): Promise<User> => {
    try {
      console.log(`Вход пользователя: ${email}...`);

      // Проверяем существующую сессию
      let existingUser = null;
      try {
        existingUser = await authApi.getCurrentUser();
      } catch (e) {
        // Продолжаем, если ошибка
      }

      // Если сессия существует, удаляем её
      if (existingUser) {
        await account.deleteSession("current");
      }

      // Создаем новую сессию
      await account.createEmailPasswordSession(email, password);

      // Проверяем данные пользователя
      const userResult = await authApi.getCurrentUser();

      // Обработка неактивированного пользователя
      if (
        userResult &&
        typeof userResult === "object" &&
        "notActivated" in userResult
      ) {
        // Удаляем сессию для неактивированного пользователя
        await account.deleteSession("current");
        throw new Error(
          "Ваш аккаунт ожидает активации администратором или академ советником."
        );
      }

      if (!userResult) {
        throw new Error("Не удалось получить данные пользователя");
      }
      return userResult as User;
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes(
          "Creation of a session is prohibited when a session is active"
        )
      ) {
        console.error("Обнаружена активная сессия");

        const currentUser = await authApi.getCurrentUser();
        if (
          currentUser &&
          typeof currentUser === "object" &&
          "notActivated" in currentUser
        ) {
          throw new Error(
            "Ваш аккаунт ожидает активации администратором или академ советником."
          );
        }
      }
      console.error("Ошибка при входе в систему:", error);
      throw error;
    }
  },

  // Выход из системы
  logout: async (): Promise<boolean> => {
    try {
      console.log("Выход из системы...");
      await account.deleteSession("current");
      console.log("Сессия успешно удалена");
      return true;
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
      throw error;
    }
  },

  // Активация пользователя
  activateUser: async (userId: string): Promise<User> => {
    try {
      console.log(`Активация пользователя с ID: ${userId}...`);
      const user = await database.updateDocument(
        DATABASE_ID,
        collections.users,
        userId,
        { isActive: true }
      );
      console.log("Пользователь успешно активирован");
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при активации пользователя:", error);
      throw error;
    }
  },

  // Деактивация пользователя
  deactivateUser: async (userId: string): Promise<User> => {
    try {
      console.log(`Деактивация пользователя с ID: ${userId}...`);
      const user = await database.updateDocument(
        DATABASE_ID,
        collections.users,
        userId,
        { isActive: false }
      );
      console.log("Пользователь успешно деактивирован");
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при деактивации пользователя:", error);
      throw error;
    }
  },

  // Создание пользователя (для Академ советников)
  createUser: async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    createdBy: string
  ): Promise<User> => {
    try {
      console.log(`Создание пользователя: ${email} с ролью ${role}...`);

      // Создаем пользователя в Appwrite Auth
      const authUser = await account.create(ID.unique(), email, password, name);

      // Создаем документ пользователя в базе данных
      const userData = {
        name,
        email,
        role,
        isActive: false, // Новые пользователи требуют активации
        createdAt: new Date().toISOString(),
        createdBy,
      };

      const user = await database.createDocument(
        DATABASE_ID,
        collections.users,
        authUser.$id,
        userData
      );

      console.log("Пользователь успешно создан:", user.$id);
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
      throw error;
    }
  },
};

// Ключи для React Query
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  users: () => [...authKeys.all, "users"] as const,
  pendingUsers: () => [...authKeys.all, "pending"] as const,
  usersByRole: (role: UserRole) => [...authKeys.users(), role] as const,
};

// React Query хуки
export const useCurrentUser = () => {
  return useQuery<GetUserResult>({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => authApi.register(name, email, password, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.clear(); // Очищаем весь кэш при выходе
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authApi.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
      role,
      createdBy,
    }: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      createdBy: string;
    }) => authApi.createUser(name, email, password, role, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
    },
  });
};

// Хук для получения списка неактивированных пользователей
export const usePendingUsers = () => {
  return useQuery({
    queryKey: authKeys.pendingUsers(),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("isActive", false)]
        );
        console.log(
          "Результат запроса неактивированных пользователей:",
          result
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error(
          "Ошибка при получении неактивированных пользователей:",
          error
        );
        return [];
      }
    },
  });
};

// Хуки для получения пользователей по ролям
export const useUsersByRole = (role: UserRole) => {
  return useQuery({
    queryKey: authKeys.usersByRole(role),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("role", role)]
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error(
          `Ошибка при получении пользователей с ролью ${role}:`,
          error
        );
        return [];
      }
    },
  });
};

// Специфичные хуки для конкретных ролей
export const useSuperAdmins = () => useUsersByRole(UserRole.SUPER_ADMIN);
export const useAcademicCouncil = () =>
  useUsersByRole(UserRole.ACADEMIC_ADVISOR);
export const useTeachers = () => useUsersByRole(UserRole.TEACHER);
export const useStudents = () => useUsersByRole(UserRole.STUDENT);

// Хуки для активных пользователей по ролям
export const useActiveUsersByRole = (role: UserRole) => {
  return useQuery({
    queryKey: [...authKeys.usersByRole(role), "active"],
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("role", role), Query.equal("isActive", true)]
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error(
          `Ошибка при получении активных пользователей с ролью ${role}:`,
          error
        );
        return [];
      }
    },
  });
};

export const useActiveTeachers = () => useActiveUsersByRole(UserRole.TEACHER);
export const useActiveStudents = () => useActiveUsersByRole(UserRole.STUDENT);
export const useActiveAcademicCouncil = () =>
  useActiveUsersByRole(UserRole.ACADEMIC_ADVISOR);

// Хук для получения всех пользователей
export const useAllUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error("Ошибка при получении списка пользователей:", error);
        return [];
      }
    },
  });
};
