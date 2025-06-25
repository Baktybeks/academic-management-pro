// src/components/grades/CurrentGradesView.tsx

import React from "react";
import { BarChart3 } from "lucide-react";
import {
  User,
  Assignment,
  AssignmentSubmission,
  Subject,
  Group,
} from "@/types";
import { StudentGradeCard } from "./StudentGradeCard";

interface CurrentGradesViewProps {
  studentGrades: Array<{
    student: User;
    grades: Array<{
      assignment: Assignment;
      submission: AssignmentSubmission;
      subject: Subject;
      group: Group;
    }>;
    totalScore: number;
    maxScore: number;
    averagePercentage: number;
  }>;
  searchTerm: string;
  selectedSubject: string;
  selectedGroup: string;
}

export function CurrentGradesView({
  studentGrades,
  searchTerm,
  selectedSubject,
  selectedGroup,
}: CurrentGradesViewProps) {
  if (studentGrades.length > 0) {
    return (
      <div className="space-y-6">
        {studentGrades.map((studentData) => (
          <StudentGradeCard
            key={studentData.student.$id}
            studentData={studentData}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow border">
      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Оценок не найдено
      </h3>
      <p className="text-gray-500">
        {searchTerm || selectedSubject !== "all" || selectedGroup !== "all"
          ? "Попробуйте изменить фильтры поиска"
          : "Проверьте работы студентов, чтобы увидеть оценки"}
      </p>
    </div>
  );
}
