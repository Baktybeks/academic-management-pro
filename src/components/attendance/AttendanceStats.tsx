// src/components/attendance/AttendanceStats.tsx

import React from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Calendar,
  Target,
} from "lucide-react";

interface AttendanceStats {
  totalStudents: number;
  averageAttendance: number;
  excellentAttendance: number;
  goodAttendance: number;
  poorAttendance: number;
  totalLessons: number;
  totalMissed: number;
}

interface AttendanceStatsComponentProps {
  stats: AttendanceStats;
}

export function AttendanceStatsComponent({
  stats,
}: AttendanceStatsComponentProps) {
  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600";
    if (attendance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceIcon = (attendance: number) => {
    if (attendance >= 85) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    }
    return <TrendingDown className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Всего студентов</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalStudents}
            </p>
            <p className="text-xs text-gray-500">в системе</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Target className="h-8 w-8 text-purple-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Средняя посещаемость
            </p>
            <div className="flex items-center gap-2">
              <p
                className={`text-2xl font-bold ${getAttendanceColor(
                  stats.averageAttendance
                )}`}
              >
                {stats.averageAttendance}%
              </p>
              {getAttendanceIcon(stats.averageAttendance)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Отличная посещаемость
            </p>
            <p className="text-2xl font-bold text-green-600">
              {stats.excellentAttendance}
            </p>
            <p className="text-xs text-gray-500">90%+ посещений</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <BookOpen className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Хорошая посещаемость
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.goodAttendance}
            </p>
            <p className="text-xs text-gray-500">75-89% посещений</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Низкая посещаемость
            </p>
            <p className="text-2xl font-bold text-red-600">
              {stats.poorAttendance}
            </p>
            <p className="text-xs text-gray-500">&lt;75% посещений</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Проведено занятий
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalLessons}
            </p>
            <p className="text-xs text-gray-500">
              {stats.totalMissed} пропущено
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
