// src/components/attendance/AttendanceAnalytics.tsx

import React from "react";
import { Users, BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { AttendanceRecord } from "@/services/attendanceAnalytics";

interface AttendanceAnalyticsProps {
  records: AttendanceRecord[];
  groupStats: Array<{
    groupId: string;
    groupName: string;
    studentCount: number;
    averageAttendance: number;
    excellentCount: number;
    poorCount: number;
  }>;
  subjectStats: Array<{
    subjectId: string;
    subjectName: string;
    recordCount: number;
    averageAttendance: number;
    excellentCount: number;
    poorCount: number;
  }>;
}

export function AttendanceAnalytics({
  records,
  groupStats,
  subjectStats,
}: AttendanceAnalyticsProps) {
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceIcon = (rate: number, previousRate?: number) => {
    if (previousRate !== undefined) {
      if (rate > previousRate)
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      if (rate < previousRate)
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow border">
        <div className="text-gray-400 mb-4">
          <BookOpen className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Нет данных для аналитики
        </h3>
        <p className="text-gray-500">
          Добавьте данные о посещаемости для просмотра аналитики.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Статистика по группам */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Статистика по группам
        </h3>

        {groupStats.length > 0 ? (
          <div className="space-y-4">
            {groupStats.map((group) => (
              <div
                key={group.groupId}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {group.groupName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {group.studentCount} студентов
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>Отличная: {group.excellentCount}</span>
                    <span>Низкая: {group.poorCount}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold text-lg ${getAttendanceColor(
                      group.averageAttendance
                    )}`}
                  >
                    {group.averageAttendance}%
                  </div>
                  <div className="text-sm text-gray-500">Средняя</div>

                  {/* Прогресс-бар */}
                  <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        group.averageAttendance >= 90
                          ? "bg-green-500"
                          : group.averageAttendance >= 75
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(group.averageAttendance, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Нет данных по группам</p>
          </div>
        )}
      </div>

      {/* Статистика по дисциплинам */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Статистика по дисциплинам
        </h3>

        {subjectStats.length > 0 ? (
          <div className="space-y-4">
            {subjectStats.map((subject) => (
              <div
                key={subject.subjectId}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {subject.subjectName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {subject.recordCount} записей
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>Отличная: {subject.excellentCount}</span>
                    <span>Низкая: {subject.poorCount}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold text-lg ${getAttendanceColor(
                      subject.averageAttendance
                    )}`}
                  >
                    {subject.averageAttendance}%
                  </div>
                  <div className="text-sm text-gray-500">Средняя</div>

                  {/* Прогресс-бар */}
                  <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        subject.averageAttendance >= 90
                          ? "bg-green-500"
                          : subject.averageAttendance >= 75
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(subject.averageAttendance, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Нет данных по дисциплинам</p>
          </div>
        )}
      </div>

      {/* Топ студенты */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Лучшая посещаемость
        </h3>

        {records.length > 0 ? (
          <div className="space-y-3">
            {records
              .sort((a, b) => b.attendanceRate - a.attendanceRate)
              .slice(0, 5)
              .map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {record.studentName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.groupName} • {record.subjectName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {record.attendanceRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.attendedLessons}/{record.totalLessons}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Нет данных о студентах</p>
          </div>
        )}
      </div>

      {/* Студенты, требующие внимания */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Требуют внимания
        </h3>

        {records.filter((r) => r.attendanceRate < 75).length > 0 ? (
          <div className="space-y-3">
            {records
              .filter((r) => r.attendanceRate < 75)
              .sort((a, b) => a.attendanceRate - b.attendanceRate)
              .slice(0, 5)
              .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {record.studentName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.groupName} • {record.subjectName}
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Пропущено: {record.missedLessons} из {record.totalLessons}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {record.attendanceRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.attendedLessons}/{record.totalLessons}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Все студенты имеют хорошую посещаемость!</p>
          </div>
        )}
      </div>
    </div>
  );
}
