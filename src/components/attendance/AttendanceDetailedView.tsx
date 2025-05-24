// src/components/attendance/AttendanceDetailedView.tsx

import React from "react";
import { UserCheck, UserX } from "lucide-react";
import { AttendanceRecord } from "@/services/attendanceAnalytics";

interface AttendanceDetailedViewProps {
  records: AttendanceRecord[];
}

export function AttendanceDetailedView({
  records,
}: AttendanceDetailedViewProps) {
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90) return "bg-green-100 text-green-800";
    if (rate >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow border">
        <div className="text-gray-400 mb-4">
          <UserCheck className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Нет данных для отображения
        </h3>
        <p className="text-gray-500">
          Попробуйте изменить фильтры или проверьте наличие данных о
          посещаемости.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {records.map((record) => (
        <div key={record.id} className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {record.studentName}
              </h3>
              <p className="text-sm text-gray-600">
                {record.groupName} • {record.subjectName} • {record.teacherName}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${getAttendanceColor(
                  record.attendanceRate
                )}`}
              >
                {record.attendanceRate.toFixed(1)}%
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs rounded-full ${getAttendanceBadge(
                  record.attendanceRate
                )}`}
              >
                {record.attendedLessons}/{record.totalLessons} занятий
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Статистика посещаемости
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Посещено:</span>
                  <span className="font-medium text-green-600">
                    {record.attendedLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Пропущено:</span>
                  <span className="font-medium text-red-600">
                    {record.missedLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Всего занятий:</span>
                  <span className="font-medium">{record.totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Процент посещения:
                  </span>
                  <span
                    className={`font-medium ${getAttendanceColor(
                      record.attendanceRate
                    )}`}
                  >
                    {record.attendanceRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Прогресс-бар */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Прогресс посещаемости</span>
                  <span>{record.attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      record.attendanceRate >= 90
                        ? "bg-green-500"
                        : record.attendanceRate >= 75
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(record.attendanceRate, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Последние занятия
              </h4>
              {record.recentAttendance.length > 0 ? (
                <div className="space-y-2">
                  {record.recentAttendance.map((attendance, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="text-sm text-gray-700">
                          {new Date(attendance.date).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attendance.lessonTitle}
                        </div>
                      </div>
                      <span className="flex items-center gap-2">
                        {attendance.present ? (
                          <>
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              Присутствовал
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">
                              Отсутствовал
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <UserX className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Нет данных о занятиях</p>
                </div>
              )}
            </div>
          </div>

          {/* Рекомендации для студентов с низкой посещаемостью */}
          {record.attendanceRate < 75 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <h5 className="text-sm font-medium text-red-800 mb-1">
                Низкая посещаемость - требуется внимание
              </h5>
              <p className="text-sm text-red-700">
                Студент пропустил {record.missedLessons} из{" "}
                {record.totalLessons} занятий. Рекомендуется провести беседу и
                выяснить причины пропусков.
              </p>
            </div>
          )}

          {/* Поощрение для студентов с отличной посещаемостью */}
          {record.attendanceRate >= 95 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <h5 className="text-sm font-medium text-green-800 mb-1">
                Отличная посещаемость!
              </h5>
              <p className="text-sm text-green-700">
                Студент показывает превосходную дисциплину с посещаемостью{" "}
                {record.attendanceRate.toFixed(1)}%.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
