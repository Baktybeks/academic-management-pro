// src/components/grades/AssignmentGradeCard.tsx

import React from "react";
import { BookOpen, Star } from "lucide-react";
import { Assignment, AssignmentSubmission, Subject, Group } from "@/types";

interface AssignmentGradeCardProps {
  assignment: Assignment;
  submission: AssignmentSubmission;
  subject: Subject;
  group: Group;
}

export function AssignmentGradeCard({
  assignment,
  submission,
  subject,
  group,
}: AssignmentGradeCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-2">{assignment.title}</h4>
        <div className="flex items-center gap-1 ml-2">
          <Star className="h-4 w-4" />
          <span className="font-bold">
            {submission.score}/{assignment.maxScore}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
        <BookOpen className="h-3 w-3" />
        <span>{subject.title}</span>
        <span>•</span>
        <span>{group.title}</span>
      </div>

      {submission.comment && (
        <div className="mt-2 text-xs text-gray-600 italic">
          {submission.comment}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        {new Date(
          submission.checkedAt || submission.submittedAt
        ).toLocaleDateString("ru-RU")}
      </div>
    </div>
  );
}
