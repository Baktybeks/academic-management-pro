// src/components/attendance/AttendanceFilters.tsx

import React from "react";
import { Download } from "lucide-react";
import { User, Group, Subject } from "@/types";

interface AttendanceFiltersProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
  selectedGroup: string;
  setSelectedGroup: (groupId: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subjectId: string) => void;
  selectedTeacher: string;
  setSelectedTeacher: (teacherId: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  groups: Group[];
  subjects: Subject[];
  teachers: User[];
  onExport: () => void;
}

export function AttendanceFilters({
  viewMode,
  setViewMode,
  selectedGroup,
  setSelectedGroup,
  selectedSubject,
  setSelectedSubject,
  selectedTeacher,
  setSelectedTeacher,
  selectedPeriod,
  setSelectedPeriod,
  groups,
  subjects,
  teachers,
  onExport,
}: AttendanceFiltersProps) {
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow border-[#6699FF]">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Режим просмотра
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="overview">Обзор</option>
            <option value="detailed">Детально</option>
            <option value="analytics">Аналитика</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Группа
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Все группы</option>
            {groups.map((group) => (
              <option key={group.$id} value={group.$id}>
                {group.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дисциплина
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Все дисциплины</option>
            {subjects.map((subject) => (
              <option key={subject.$id} value={subject.$id}>
                {subject.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Преподаватель
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Все преподаватели</option>
            {teachers.map((teacher) => (
              <option key={teacher.$id} value={teacher.$id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Период
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="semester">Семестр</option>
            <option value="year">Год</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Экспорт
          </button>
        </div>
      </div>
    </div>
  );
}
