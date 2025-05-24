// src/app/(dashboard)/super-admin/settings/page.tsx

"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Shield,
  Mail,
  Bell,
  Globe,
  Palette,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Upload,
} from "lucide-react";

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);

  // Состояния настроек
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "Система оценки компетенций",
    systemDescription:
      "Платформа для оценки компетенций преподавателей и студентов",
    timeZone: "Europe/Moscow",
    dateFormat: "DD.MM.YYYY",
    language: "ru",
    maintenanceMode: false,
  });

  const [userSettings, setUserSettings] = useState({
    autoActivateUsers: false,
    defaultUserRole: "STUDENT",
    passwordMinLength: 6,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    requireEmailVerification: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    userRegistrationNotify: true,
    surveyCompletionNotify: true,
    adminEmail: "admin@system.ru",
    smtpServer: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
  });

  const [academicSettings, setAcademicSettings] = useState({
    gradingScale: "10-point",
    passGrade: 6,
    attendanceRequired: true,
    surveyAnonymous: true,
    autoGradeCalculation: true,
    semesterDuration: 18,
  });

  const [securitySettings, setSecuritySettings] = useState({
    dataEncryption: true,
    auditLogging: true,
    ipWhitelist: "",
    twoFactorAuth: false,
    passwordPolicy: "medium",
    dataRetentionPeriod: 365,
  });

  const handleSaveSettings = async (settingsType: string) => {
    setIsLoading(true);
    try {
      // Здесь будет логика сохранения настроек
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Настройки ${settingsType} успешно сохранены`);
    } catch (error) {
      toast.error("Ошибка при сохранении настроек");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSettings = () => {
    const allSettings = {
      general: generalSettings,
      users: userSettings,
      notifications: notificationSettings,
      academic: academicSettings,
      security: securitySettings,
    };

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `system-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        if (settings.general) setGeneralSettings(settings.general);
        if (settings.users) setUserSettings(settings.users);
        if (settings.notifications)
          setNotificationSettings(settings.notifications);
        if (settings.academic) setAcademicSettings(settings.academic);
        if (settings.security) setSecuritySettings(settings.security);

        toast.success("Настройки успешно импортированы");
      } catch (error) {
        toast.error("Ошибка при импорте настроек");
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: "general", label: "Общие", icon: Settings },
    { id: "users", label: "Пользователи", icon: Users },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "academic", label: "Учебный процесс", icon: Globe },
    { id: "security", label: "Безопасность", icon: Shield },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Системные настройки
        </h1>
        <p className="text-gray-600">
          Конфигурация и управление параметрами системы
        </p>
      </div>

      {/* Импорт/Экспорт */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Управление конфигурацией
            </h3>
            <p className="text-sm text-gray-600">
              Экспорт и импорт настроек системы
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportSettings}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Экспорт настроек
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              Импорт настроек
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Боковое меню */}
        <div className="w-64 bg-white rounded-lg shadow border p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Основной контент */}
        <div className="flex-1">
          {/* Общие настройки */}
          {activeTab === "general" && (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Общие настройки
                </h2>
                <button
                  onClick={() => handleSaveSettings("общие")}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название системы
                  </label>
                  <input
                    type="text"
                    value={generalSettings.systemName}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        systemName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Часовой пояс
                  </label>
                  <select
                    value={generalSettings.timeZone}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        timeZone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Europe/Moscow">Москва (UTC+3)</option>
                    <option value="Europe/Kiev">Киев (UTC+2)</option>
                    <option value="Asia/Almaty">Алматы (UTC+6)</option>
                    <option value="Asia/Tashkent">Ташкент (UTC+5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат даты
                  </label>
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        dateFormat: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="DD.MM.YYYY">ДД.ММ.ГГГГ</option>
                    <option value="MM/DD/YYYY">ММ/ДД/ГГГГ</option>
                    <option value="YYYY-MM-DD">ГГГГ-ММ-ДД</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Язык системы
                  </label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="kz">Қазақша</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание системы
                  </label>
                  <textarea
                    value={generalSettings.systemDescription}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        systemDescription: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          maintenanceMode: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="maintenanceMode"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Режим технического обслуживания
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    В этом режиме только суперадминистраторы могут войти в
                    систему
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Настройки пользователей */}
          {activeTab === "users" && (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Настройки пользователей
                </h2>
                <button
                  onClick={() => handleSaveSettings("пользователей")}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Роль по умолчанию
                    </label>
                    <select
                      value={userSettings.defaultUserRole}
                      onChange={(e) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          defaultUserRole: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="STUDENT">Студент</option>
                      <option value="TEACHER">Преподаватель</option>
                      <option value="ACADEMIC_ADVISOR">Академсоветник</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Минимальная длина пароля
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={userSettings.passwordMinLength}
                      onChange={(e) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          passwordMinLength: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Время сессии (часы)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={userSettings.sessionTimeout}
                      onChange={(e) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          sessionTimeout: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Максимум попыток входа
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={userSettings.maxLoginAttempts}
                      onChange={(e) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          maxLoginAttempts: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoActivateUsers"
                      checked={userSettings.autoActivateUsers}
                      onChange={(e) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          autoActivateUsers: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoActivateUsers"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Автоматическая активация новых пользователей
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      checked={userSettings.requireEmailVerification}
                      onChange={(e) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          requireEmailVerification: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="requireEmailVerification"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Требовать подтверждение email при регистрации
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Настройки уведомлений */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Настройки уведомлений
                </h2>
                <button
                  onClick={() => handleSaveSettings("уведомлений")}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Общие настройки
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            emailNotifications: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="emailNotifications"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Email уведомления
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="systemAlerts"
                        checked={notificationSettings.systemAlerts}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            systemAlerts: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="systemAlerts"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Системные оповещения
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="userRegistrationNotify"
                        checked={notificationSettings.userRegistrationNotify}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            userRegistrationNotify: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="userRegistrationNotify"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Уведомления о регистрации пользователей
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="surveyCompletionNotify"
                        checked={notificationSettings.surveyCompletionNotify}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            surveyCompletionNotify: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="surveyCompletionNotify"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Уведомления о завершении опросов
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Настройки SMTP
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email администратора
                      </label>
                      <input
                        type="email"
                        value={notificationSettings.adminEmail}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            adminEmail: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP сервер
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.smtpServer}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            smtpServer: e.target.value,
                          }))
                        }
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP порт
                      </label>
                      <input
                        type="number"
                        value={notificationSettings.smtpPort}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            smtpPort: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP имя пользователя
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.smtpUsername}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            smtpUsername: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP пароль
                      </label>
                      <input
                        type="password"
                        value={notificationSettings.smtpPassword}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            smtpPassword: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Академические настройки */}
          {activeTab === "academic" && (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Настройки учебного процесса
                </h2>
                <button
                  onClick={() => handleSaveSettings("учебного процесса")}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Система оценивания
                    </label>
                    <select
                      value={academicSettings.gradingScale}
                      onChange={(e) =>
                        setAcademicSettings((prev) => ({
                          ...prev,
                          gradingScale: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="10-point">10-балльная</option>
                      <option value="5-point">5-балльная</option>
                      <option value="100-point">100-балльная</option>
                      <option value="letter">Буквенная (A-F)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Проходной балл
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={academicSettings.passGrade}
                      onChange={(e) =>
                        setAcademicSettings((prev) => ({
                          ...prev,
                          passGrade: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Длительность семестра (недели)
                    </label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={academicSettings.semesterDuration}
                      onChange={(e) =>
                        setAcademicSettings((prev) => ({
                          ...prev,
                          semesterDuration: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="attendanceRequired"
                      checked={academicSettings.attendanceRequired}
                      onChange={(e) =>
                        setAcademicSettings((prev) => ({
                          ...prev,
                          attendanceRequired: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="attendanceRequired"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Обязательный учет посещаемости
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="surveyAnonymous"
                      checked={academicSettings.surveyAnonymous}
                      onChange={(e) =>
                        setAcademicSettings((prev) => ({
                          ...prev,
                          surveyAnonymous: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="surveyAnonymous"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Анонимные опросы студентов
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoGradeCalculation"
                      checked={academicSettings.autoGradeCalculation}
                      onChange={(e) =>
                        setAcademicSettings((prev) => ({
                          ...prev,
                          autoGradeCalculation: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoGradeCalculation"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Автоматический расчет итоговых оценок
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Настройки безопасности */}
          {activeTab === "security" && (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Настройки безопасности
                </h2>
                <button
                  onClick={() => handleSaveSettings("безопасности")}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Политика паролей
                    </label>
                    <select
                      value={securitySettings.passwordPolicy}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          passwordPolicy: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="weak">Слабая</option>
                      <option value="medium">Средняя</option>
                      <option value="strong">Строгая</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Период хранения данных (дни)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="3650"
                      value={securitySettings.dataRetentionPeriod}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          dataRetentionPeriod: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Белый список IP-адресов
                    </label>
                    <textarea
                      value={securitySettings.ipWhitelist}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          ipWhitelist: e.target.value,
                        }))
                      }
                      placeholder="192.168.1.1&#10;10.0.0.0/8"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Один IP-адрес или подсеть на строку. Оставьте пустым для
                      отключения
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dataEncryption"
                      checked={securitySettings.dataEncryption}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          dataEncryption: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="dataEncryption"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Шифрование чувствительных данных
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auditLogging"
                      checked={securitySettings.auditLogging}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          auditLogging: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="auditLogging"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Ведение журнала аудита
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          twoFactorAuth: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="twoFactorAuth"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Двухфакторная аутентификация (в разработке)
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Важно!
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Изменения настроек безопасности могут повлиять на доступ
                        пользователей к системе. Убедитесь, что вы понимаете
                        последствия перед сохранением.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Статус системы */}
      <div className="mt-8 bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-green-500" />
          Статус системы
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">База данных</div>
              <div className="text-sm text-gray-500">Подключена</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">
                Файловое хранилище
              </div>
              <div className="text-sm text-gray-500">Доступно</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium text-gray-900">
                Последнее обновление
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("ru-RU")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
