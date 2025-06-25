// src/components/grades/GradesStats.tsx

import React from "react";
import { Users, FileText, TrendingUp, Award } from "lucide-react";

interface GradesStatsProps {
  stats: {
    totalStudents: number;
    totalGrades: number;
    gradedCount: number;
    averagePercentage: number;
    excellentCount: number;
  };
  viewMode: "current" | "final";
}

export function GradesStats({ stats, viewMode }: GradesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Студентов</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalStudents}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              {viewMode === "final" ? "Всего позиций" : "Всего оценок"}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalGrades}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Средний %</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.averagePercentage}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Отличных</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.excellentCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
