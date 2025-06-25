import React from "react";
import { FileText, UserCheck, Save, Award, AlertCircle } from "lucide-react";
import {
  User,
  Subject,
  Group,
  getLetterGradeColor,
  GradingPeriod,
} from "@/types";

export interface FinalGradeData {
  key: string;
  student: User;
  subject: Subject;
  group: Group;
  currentScore: number;
  maxHomeworkScore: number;
  currentLetterGrade: string;
  totalLessons: number;
  attendedLessons: number;
  finalScore: number;
  finalLetterGrade: string;
  hasExistingGrade: boolean;
}

interface FinalGradesTableProps {
  activePeriod: GradingPeriod | undefined;
  finalGradesData: FinalGradeData[];
  editingGrades: Record<string, { score: number; letterGrade: string }>;
  selectedSubject: string;
  selectedGroup: string;
  searchTerm: string;
  saveFinalGradeMutation: {
    isPending: boolean;
  };
  onEditGrade: (key: string, score: number) => void;
  onSaveGrade: (item: FinalGradeData) => void;
}

export function FinalGradesTable({
  activePeriod,
  finalGradesData,
  editingGrades,
  selectedSubject,
  selectedGroup,
  searchTerm,
  saveFinalGradeMutation,
  onEditGrade,
  onSaveGrade,
}: FinalGradesTableProps) {
  if (!activePeriod) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow border">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Нет активного периода оценок
        </h3>
        <p className="text-gray-500">
          Обратитесь к супер администратору для активации периода выставления
          финальных оценок
        </p>
      </div>
    );
  }

  const filteredData = finalGradesData.filter((item) => {
    if (selectedSubject !== "all" && item.subject.$id !== selectedSubject)
      return false;
    if (selectedGroup !== "all" && item.group.$id !== selectedGroup)
      return false;
    if (
      searchTerm &&
      !item.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Финальные оценки - {activePeriod.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Выставите финальные оценки студентам по своим дисциплинам
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ФИО
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дисциплина
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Группа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Баллы за дз
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Посещение лекций
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Финальные баллы
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Оценка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr
                key={item.key}
                className={item.hasExistingGrade ? "bg-green-50" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {item.student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.student.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.subject.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.group.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {item.currentScore}/{item.maxHomeworkScore}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {item.attendedLessons}/{item.totalLessons}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingGrades[item.key]?.score ?? item.finalScore}
                    onChange={(e) =>
                      onEditGrade(item.key, parseInt(e.target.value) || 0)
                    }
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLetterGradeColor(
                      item.finalLetterGrade
                    )}`}
                  >
                    {item.finalLetterGrade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSaveGrade(item)}
                      disabled={saveFinalGradeMutation.isPending}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      title="Сохранить"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        onEditGrade(
                          item.key,
                          item.hasExistingGrade
                            ? item.finalScore
                            : item.currentScore
                        )
                      }
                      className="text-gray-600 hover:text-gray-900"
                      title="Сбросить к текущим баллам"
                    >
                      ↺
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Нет данных для выставления оценок
          </h3>
          <p className="text-gray-500">
            Убедитесь, что у вас есть назначения групп и дисциплин
          </p>
        </div>
      )}
    </div>
  );
}
