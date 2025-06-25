// src/components/grades/StudentGradeCard.tsx

import React from "react";
import {
  User,
  Assignment,
  AssignmentSubmission,
  Subject,
  Group,
} from "@/types";
import { AssignmentGradeCard } from "./AssignmentGradeCard";

interface StudentGradeCardProps {
  studentData: {
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
  };
}

export function StudentGradeCard({ studentData }: StudentGradeCardProps) {
  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {studentData.student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {studentData.student.name}
              </h3>
              <p className="text-sm text-gray-600">
                {studentData.student.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              {Math.round(studentData.averagePercentage)}%
            </div>
            <div className="text-sm text-gray-600">
              {studentData.totalScore} из {studentData.maxScore} баллов
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentData.grades.map((grade) => (
            <AssignmentGradeCard
              key={`${grade.assignment.$id}-${grade.submission.$id}`}
              assignment={grade.assignment}
              submission={grade.submission}
              subject={grade.subject}
              group={grade.group}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
