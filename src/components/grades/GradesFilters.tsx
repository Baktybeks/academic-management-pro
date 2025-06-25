// src/components/grades/GradesFilters.tsx

import React from "react";
import { Search } from "lucide-react";
import { Subject, Group } from "@/types";

interface GradesFiltersProps {
  searchTerm: string;
  selectedSubject: string;
  selectedGroup: string;
  teacherSubjects: Subject[];
  teacherGroups: Group[];
  onSearchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onGroupChange: (value: string) => void;
}

export function GradesFilters({
  searchTerm,
  selectedSubject,
  selectedGroup,
  teacherSubjects,
  teacherGroups,
  onSearchChange,
  onSubjectChange,
  onGroupChange,
}: GradesFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск студента
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Имя студента..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дисциплина
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Все дисциплины</option>
            {teacherSubjects.map((subject) => (
              <option key={subject.$id} value={subject.$id}>
                {subject.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Группа
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Все группы</option>
            {teacherGroups.map((group) => (
              <option key={group.$id} value={group.$id}>
                {group.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
