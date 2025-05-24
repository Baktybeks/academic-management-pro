// src/components/attendance/AttendanceDistribution.tsx

import React from "react";
import { PieChart, BarChart3, TrendingUp, Users } from "lucide-react";

interface AttendanceStats {
  totalStudents: number;
  averageAttendance: number;
  excellentAttendance: number;
  goodAttendance: number;
  poorAttendance: number;
  totalLessons: number;
  totalMissed: number;
}

interface AttendanceDistributionProps {
  stats: AttendanceStats;
}

export function AttendanceDistribution({ stats }: AttendanceDistributionProps) {
  const distributionData = [
    {
      label: "Отличная посещаемость",
      count: stats.excellentAttendance,
      percentage: Math.round(
        (stats.excellentAttendance / stats.totalStudents) * 100
      ),
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      description: "90% и выше",
    },
    {
      label: "Хорошая посещаемость",
      count: stats.goodAttendance,
      percentage: Math.round(
        (stats.goodAttendance / stats.totalStudents) * 100
      ),
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      description: "75-89%",
    },
    {
      label: "Удовлетворительная",
      count:
        stats.totalStudents -
        stats.excellentAttendance -
        stats.goodAttendance -
        stats.poorAttendance,
      percentage: Math.round(
        ((stats.totalStudents -
          stats.excellentAttendance -
          stats.goodAttendance -
          stats.poorAttendance) /
          stats.totalStudents) *
          100
      ),
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      description: "60-74%",
    },
    {
      label: "Низкая посещаемость",
      count: stats.poorAttendance,
      percentage: Math.round(
        (stats.poorAttendance / stats.totalStudents) * 100
      ),
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      description: "Менее 60%",
    },
  ];

  const maxPercentage = Math.max(...distributionData.map((d) => d.percentage));

  return (
    <div className="mb-6 bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          Распределение посещаемости
        </h3>
        <div className="text-sm text-gray-500">
          Всего студентов: {stats.totalStudents}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {distributionData.map((item, index) => (
          <div key={index} className={`${item.bgColor} p-4 rounded-lg border`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
              <span className="text-sm font-medium text-gray-600">
                {item.percentage}%
              </span>
            </div>
            <div className="mb-2">
              <div className={`text-xl font-bold ${item.textColor}`}>
                {item.count}
              </div>
              <div className="text-sm text-gray-600">{item.label}</div>
              <div className="text-xs text-gray-500 mt-1">
                {item.description}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Визуальная диаграмма */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Горизонтальная диаграмма */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">
            Детальное распределение
          </h4>
          <div className="space-y-3">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 ${item.color} rounded-full flex-shrink-0`}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Сводная информация */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Сводная информация</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">
                  Студенты с хорошей посещаемостью
                </span>
              </div>
              <span className="font-medium text-green-600">
                {stats.excellentAttendance + stats.goodAttendance}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-700">Требуют внимания</span>
              </div>
              <span className="font-medium text-red-600">
                {stats.poorAttendance}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700">
                  Общая эффективность
                </span>
              </div>
              <span
                className={`font-medium ${
                  stats.averageAttendance >= 85
                    ? "text-green-600"
                    : stats.averageAttendance >= 75
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {stats.averageAttendance}%
              </span>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Цель:</strong> Поддерживать среднюю посещаемость выше
                85% и минимизировать количество студентов с низкой
                посещаемостью.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Рекомендации */}
      {stats.poorAttendance > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="font-medium text-yellow-800 mb-2">Рекомендации</h5>
          <div className="text-sm text-yellow-700 space-y-1">
            {stats.poorAttendance > stats.totalStudents * 0.2 && (
              <p>
                • Высокий процент студентов с низкой посещаемостью требует
                системного анализа причин
              </p>
            )}
            {stats.averageAttendance < 75 && (
              <p>
                • Общая посещаемость ниже нормы - необходимо улучшение качества
                занятий
              </p>
            )}
            <p>
              • Провести индивидуальные беседы со студентами с посещаемостью
              менее 75%
            </p>
            <p>
              • Анализировать причины пропусков и предпринимать соответствующие
              меры
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
