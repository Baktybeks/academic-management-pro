// src/app/(dashboard)/academic-advisor/attendance/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveStudents, useActiveTeachers } from "@/services/authService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import {
  attendanceAnalyticsApi,
  AttendanceRecord,
  AttendanceFilters,
} from "@/services/attendanceAnalytics";
import { AttendanceStatsComponent } from "@/components/attendance/AttendanceStats";
import { AttendanceFilters as FiltersComponent } from "@/components/attendance/AttendanceFilters";
import { AttendanceDistribution } from "@/components/attendance/AttendanceDistribution";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceDetailedView } from "@/components/attendance/AttendanceDetailedView";
import { AttendanceAnalytics } from "@/components/attendance/AttendanceAnalytics";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function AcademicAdvisorAttendancePage() {
  const [viewMode, setViewMode] = useState<string>("overview");
  const [filters, setFilters] = useState<AttendanceFilters>({});
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );

  // Получение данных
  const { data: students = [] } = useActiveStudents();
  const { data: teachers = [] } = useActiveTeachers();

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getActiveSubjects,
  });

  // Получение записей посещаемости
  const {
    data: attendanceRecords = [],
    isLoading: recordsLoading,
    error: recordsError,
  } = useQuery({
    queryKey: ["attendance-records", filters],
    queryFn: () => attendanceAnalyticsApi.getAttendanceRecords(filters),
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  // Получение статистики
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["attendance-stats", attendanceRecords],
    queryFn: () => attendanceAnalyticsApi.getAttendanceStats(attendanceRecords),
    enabled: attendanceRecords.length > 0,
  });

  // Получение статистики по группам
  const { data: groupStats = [] } = useQuery({
    queryKey: ["group-stats", attendanceRecords],
    queryFn: () => attendanceAnalyticsApi.getGroupStats(attendanceRecords),
    enabled: attendanceRecords.length > 0,
  });

  // Получение статистики по дисциплинам
  const { data: subjectStats = [] } = useQuery({
    queryKey: ["subject-stats", attendanceRecords],
    queryFn: () => attendanceAnalyticsApi.getSubjectStats(attendanceRecords),
    enabled: attendanceRecords.length > 0,
  });

  // Обработчики фильтров
  const handleFilterChange = (key: keyof AttendanceFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  // Экспорт данных
  const handleExport = () => {
    try {
      const csvContent = attendanceAnalyticsApi.exportToCSV(attendanceRecords);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `attendance_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Отчет успешно экспортирован");
    } catch (error) {
      toast.error("Ошибка при экспорте отчета");
    }
  };

  // Обработчик просмотра деталей
  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setViewMode("detailed");
  };

  if (recordsLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка данных посещаемости...</div>
        </div>
      </div>
    );
  }

  if (recordsError) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ошибка загрузки данных
          </h3>
          <p className="text-gray-500">
            Не удалось загрузить данные о посещаемости. Попробуйте обновить
            страницу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Мониторинг посещаемости
        </h1>
        <p className="text-gray-600">
          Отслеживание и анализ посещаемости студентов на основе реальных данных
        </p>
      </div>

      {/* Статистика */}
      {stats && <AttendanceStatsComponent stats={stats} />}

      {/* Фильтры */}
      <FiltersComponent
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedGroup={filters.groupId || "all"}
        setSelectedGroup={(value) => handleFilterChange("groupId", value)}
        selectedSubject={filters.subjectId || "all"}
        setSelectedSubject={(value) => handleFilterChange("subjectId", value)}
        selectedTeacher={filters.teacherId || "all"}
        setSelectedTeacher={(value) => handleFilterChange("teacherId", value)}
        selectedPeriod="all" // Временно, пока не реализованы фильтры по времени
        setSelectedPeriod={() => {}} // Временно
        groups={groups}
        subjects={subjects}
        teachers={teachers}
        onExport={handleExport}
      />

      {/* Распределение посещаемости */}
      {stats && <AttendanceDistribution stats={stats} />}

      {/* Основной контент */}
      {viewMode === "overview" && (
        <AttendanceTable
          records={attendanceRecords}
          onViewDetails={handleViewDetails}
        />
      )}

      {viewMode === "detailed" && (
        <AttendanceDetailedView
          records={selectedRecord ? [selectedRecord] : attendanceRecords}
        />
      )}

      {viewMode === "analytics" && (
        <AttendanceAnalytics
          records={attendanceRecords}
          groupStats={groupStats}
          subjectStats={subjectStats}
        />
      )}

      {/* Предупреждения и рекомендации */}
      {stats && stats.poorAttendance > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Студенты с низкой посещаемостью
              </h3>
              <p className="text-sm text-red-700">
                {stats.poorAttendance} студентов имеют посещаемость менее 75%.
                Рекомендуется принять меры для улучшения ситуации.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Информация при отсутствии данных */}
      {attendanceRecords.length === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Нет данных о посещаемости
              </h3>
              <p className="text-sm text-blue-700">
                Для отображения статистики необходимо создать занятия и отметить
                посещаемость студентов. Обратитесь к преподавателям для ведения
                учета посещаемости.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Рекомендации по улучшению */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Рекомендации по улучшению посещаемости
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800">
              Для студентов с низкой посещаемостью:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Индивидуальные беседы с кураторами</li>
              <li>• Анализ причин пропусков</li>
              <li>• Дополнительная мотивация и поддержка</li>
              <li>• Информирование родителей (для несовершеннолетних)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800">Общие меры:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Регулярный мониторинг посещаемости</li>
              <li>• Повышение качества преподавания</li>
              <li>• Создание интересных учебных программ</li>
              <li>• Поощрение студентов с высокой посещаемостью</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Успешная статистика */}
      {stats && stats.averageAttendance >= 85 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Отличные показатели посещаемости!
              </h3>
              <p className="text-sm text-green-700">
                Средняя посещаемость составляет {stats.averageAttendance}%. Это
                говорит о высокой мотивации студентов и качестве учебного
                процесса.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
