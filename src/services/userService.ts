// src/services/userService.ts

import { Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { User, UserRole } from "@/types";

export const userApi = {
  // Получить всех пользователей
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
      return [];
    }
  },

  // Получить пользователя по ID
  getUserById: async (id: string): Promise<User | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при получении пользователя:", error);
      return null;
    }
  },

  // Получить пользователя по email
  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("email", email)]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as User)
        : null;
    } catch (error) {
      console.error("Ошибка при получении пользователя по email:", error);
      return null;
    }
  },

  // Получить пользователей по роли
  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("role", role), Query.orderAsc("name")]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error(
        `Ошибка при получении пользователей с ролью ${role}:`,
        error
      );
      return [];
    }
  },

  // Получить активных пользователей по роли
  getActiveUsersByRole: async (role: UserRole): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.equal("role", role),
          Query.equal("isActive", true),
          Query.orderAsc("name"),
        ]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error(
        `Ошибка при получении активных пользователей с ролью ${role}:`,
        error
      );
      return [];
    }
  },

  // Получить неактивных пользователей
  getInactiveUsers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("isActive", false), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении неактивных пользователей:", error);
      return [];
    }
  },

  // Обновить пользователя
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id,
        data
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      throw error;
    }
  },

  // Активировать пользователя
  activateUser: async (id: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id,
        { isActive: true }
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при активации пользователя:", error);
      throw error;
    }
  },

  // Деактивировать пользователя
  deactivateUser: async (id: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id,
        { isActive: false }
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при деактивации пользователя:", error);
      throw error;
    }
  },

  // Удалить пользователя
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      throw error;
    }
  },

  // Поиск пользователей
  searchUsers: async (searchTerm: string, role?: UserRole): Promise<User[]> => {
    try {
      const queries = [Query.orderAsc("name")];

      if (role) {
        queries.push(Query.equal("role", role));
      }

      // Appwrite не поддерживает полнотекстовый поиск, поэтому получаем всех пользователей
      // и фильтруем на клиенте
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        queries
      );

      const users = response.documents as unknown as User[];
      const searchLower = searchTerm.toLowerCase();

      return users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      return [];
    }
  },

  // Получить статистику пользователей
  getUserStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
    recentlyCreated: number;
  }> => {
    try {
      const users = await userApi.getAllUsers();

      const active = users.filter((u) => u.isActive).length;
      const inactive = users.length - active;

      const byRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>);

      // Пользователи, созданные за последние 7 дней
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentlyCreated = users.filter(
        (u) => new Date(u.$createdAt) > weekAgo
      ).length;

      return {
        total: users.length,
        active,
        inactive,
        byRole,
        recentlyCreated,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики пользователей:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {} as Record<UserRole, number>,
        recentlyCreated: 0,
      };
    }
  },

  // Получить пользователей, созданных конкретным пользователем
  getUsersCreatedBy: async (creatorId: string): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("createdBy", creatorId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении созданных пользователей:", error);
      return [];
    }
  },

  // Проверить существование пользователя по email
  checkUserExists: async (email: string): Promise<boolean> => {
    try {
      const user = await userApi.getUserByEmail(email);
      return user !== null;
    } catch (error) {
      console.error("Ошибка при проверке существования пользователя:", error);
      return false;
    }
  },

  // Массовая активация пользователей
  bulkActivateUsers: async (userIds: string[]): Promise<void> => {
    try {
      await Promise.all(userIds.map((id) => userApi.activateUser(id)));
    } catch (error) {
      console.error("Ошибка при массовой активации пользователей:", error);
      throw error;
    }
  },

  // Массовая деактивация пользователей
  bulkDeactivateUsers: async (userIds: string[]): Promise<void> => {
    try {
      await Promise.all(userIds.map((id) => userApi.deactivateUser(id)));
    } catch (error) {
      console.error("Ошибка при массовой деактивации пользователей:", error);
      throw error;
    }
  },
};
