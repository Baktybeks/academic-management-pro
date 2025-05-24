// src/components/attendance/AttendanceTable.tsx

import React, { useState } from "react";
import {
  Eye,
  UserCheck,
  UserX,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  totalLessons: number;
  attendedLessons: number;
  missedLessons: number;
  attendanceRate: number;
  recentAttendance: Array<{
    date: string;
    present: boolean;
    lessonId: string;
    lessonTitle: string;
  }>;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onViewDetails: (record: AttendanceRecord) => void;
}

type SortField =
  | "studentName"
  | "groupName"
  | "subjectName"
  | "attendanceRate"
  | "totalLessons"
  | "missedLessons";
type SortDirection = "asc" | "desc";

export function AttendanceTable({
  records,
  onViewDetails,
}: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("attendanceRate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (rate >= 75) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="h-4 w-4 ml-1" />
    ) : (
      <SortDesc className="h-4 w-4 ml-1" />
    );
  };

  // Фильтрация и сортировка
  const filteredAndSortedRecords = records
    .filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.studentName.toLowerCase().includes(searchLower) ||
        record.groupName.toLowerCase().includes(searchLower) ||
        record.subjectName.toLowerCase().includes(searchLower) ||
        record.teacherName.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow border">
        <div className="text-gray-400 mb-4">
          <Users className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Нет данных о посещаемости
        </h3>
        <p className="text-gray-500">
          Попробуйте изменить фильтры или проверьте наличие занятий и данных о
          посещаемости.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border">
      {/* Поиск */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Поиск по студенту, группе, дисциплине или преподавателю..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Найдено: {filteredAndSortedRecords.length} из {records.length}{" "}
            записей
          </div>
        )}
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("studentName")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Студент
                  {getSortIcon("studentName")}
                </div>
              </th>
              <th
                onClick={() => handleSort("groupName")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Группа
                  {getSortIcon("groupName")}
                </div>
              </th>
              <th
                onClick={() => handleSort("subjectName")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Дисциплина
                  {getSortIcon("subjectName")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Преподаватель
              </th>
              <th
                onClick={() => handleSort("totalLessons")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Занятий
                  {getSortIcon("totalLessons")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Посещено
              </th>
              <th
                onClick={() => handleSort("missedLessons")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Пропущено
                  {getSortIcon("missedLessons")}
                </div>
              </th>
              <th
                onClick={() => handleSort("attendanceRate")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Посещаемость
                  {getSortIcon("attendanceRate")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Последние занятия
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getAttendanceIcon(record.attendanceRate)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {record.studentName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    {record.groupName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    {record.subjectName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.teacherName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.totalLessons}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <UserCheck className="h-4 w-4 mr-1 text-green-500" />
                    <span className="font-medium text-green-600">
                      {record.attendedLessons}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <UserX className="h-4 w-4 mr-1 text-red-500" />
                    <span className="font-medium text-red-600">
                      {record.missedLessons}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${getAttendanceBadge(
                      record.attendanceRate
                    )}`}
                  >
                    {record.attendanceRate.toFixed(1)}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {record.recentAttendance
                      .slice(0, 5)
                      .map((attendance, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            attendance.present ? "bg-green-500" : "bg-red-500"
                          }`}
                          title={`${new Date(
                            attendance.date
                          ).toLocaleDateString()} - ${
                            attendance.present
                              ? "Присутствовал"
                              : "Отсутствовал"
                          }`}
                        />
                      ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewDetails(record)}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Подробнее
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Подвал таблицы */}
      <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Показано {filteredAndSortedRecords.length} из {records.length} записей
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Отличная (90%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Хорошая (75-89%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Низкая (&lt;75%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
