// src/app/(dashboard)/teacher/grades/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { assignmentApi } from "@/services/assignmentService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import { userApi } from "@/services/userService";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import { lessonApi } from "@/services/lessonService";
import { attendanceApi } from "@/services/attendanceService";
import {
  Assignment,
  Group,
  Subject,
  User,
  AssignmentSubmission,
  Lesson,
  Attendance,
  getLetterGrade,
} from "@/types";
import { toast } from "react-toastify";
import {
  GradesStats,
  GradesFilters,
  GradesPeriodInfo,
  FinalGradesTable,
  CurrentGradesView,
  type FinalGradeData,
} from "@/components/grades";

export default function TeacherGradesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"current" | "final">("current");
  const [editingGrades, setEditingGrades] = useState<
    Record<string, { score: number; letterGrade: string }>
  >({});

  // Получаем назначения преподавателя
  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments", user?.$id],
    queryFn: () =>
      teacherAssignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем активные периоды оценок
  const { data: gradingPeriods = [] } = useQuery({
    queryKey: ["active-grading-periods"],
    queryFn: gradingPeriodApi.getActiveGradingPeriods,
  });

  // Получаем текущий активный период
  const activePeriod = gradingPeriods.find((p) => p.isActive);

  // Получаем задания преподавателя
  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments-list", user?.$id],
    queryFn: () => assignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем все ответы на задания преподавателя
  const { data: allSubmissions = [] } = useQuery({
    queryKey: ["teacher-all-submissions", assignments.map((a) => a.$id)],
    queryFn: async () => {
      if (assignments.length === 0) return [];

      const submissionPromises = assignments.map((assignment) =>
        assignmentApi.getSubmissionsByAssignment(assignment.$id)
      );

      const submissionArrays = await Promise.all(submissionPromises);
      return submissionArrays.flat();
    },
    enabled: assignments.length > 0,
  });

  // Получаем все занятия преподавателя
  const { data: allLessons = [] } = useQuery({
    queryKey: ["teacher-lessons", user?.$id],
    queryFn: () => lessonApi.getLessonsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем всю посещаемость
  const { data: allAttendance = [] } = useQuery({
    queryKey: ["all-attendance"],
    queryFn: attendanceApi.getAllAttendance,
  });

  // Получаем финальные оценки преподавателя
  const { data: finalGrades = [] } = useQuery({
    queryKey: ["teacher-final-grades", user?.$id, selectedPeriod],
    queryFn: () => gradingPeriodApi.getFinalGradesByTeacher(user?.$id || ""),
    enabled: !!user?.$id && viewMode === "final",
  });

  // Получаем дополнительные данные
  const { data: allSubjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: allGroups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => userApi.getUsersByRole("STUDENT" as any),
  });

  // Мутация для сохранения финальных оценок
  const saveFinalGradeMutation = useMutation({
    mutationFn: (data: {
      studentId: string;
      subjectId: string;
      groupId: string;
      totalScore: number;
      letterGrade: string;
    }) => {
      if (!activePeriod) throw new Error("Нет активного периода оценок");

      return gradingPeriodApi.upsertFinalGrade({
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        teacherId: user?.$id || "",
        gradingPeriodId: activePeriod.$id,
        totalScore: data.totalScore,
        letterGrade: data.letterGrade,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-final-grades"] });
      toast.success("Финальная оценка сохранена!");
    },
    onError: (error) => {
      toast.error(`Ошибка при сохранении оценки: ${error.message}`);
    },
  });

  // Создаем карты для быстрого доступа
  const assignmentsMap = React.useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      acc[assignment.$id] = assignment;
      return acc;
    }, {} as Record<string, Assignment>);
  }, [assignments]);

  const subjectsMap = React.useMemo(() => {
    return allSubjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, Subject>);
  }, [allSubjects]);

  const groupsMap = React.useMemo(() => {
    return allGroups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, Group>);
  }, [allGroups]);

  const studentsMap = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.$id] = student;
      return acc;
    }, {} as Record<string, User>);
  }, [students]);

  const lessonsMap = React.useMemo(() => {
    return allLessons.reduce((acc, lesson) => {
      acc[lesson.$id] = lesson;
      return acc;
    }, {} as Record<string, Lesson>);
  }, [allLessons]);

  // Получаем уникальные дисциплины и группы преподавателя
  const teacherSubjects = React.useMemo(() => {
    const subjectIds = new Set(teacherAssignments.map((a) => a.subjectId));
    return Array.from(subjectIds)
      .map((id) => subjectsMap[id])
      .filter(Boolean);
  }, [teacherAssignments, subjectsMap]);

  const teacherGroups = React.useMemo(() => {
    const groupIds = new Set(teacherAssignments.map((a) => a.groupId));
    return Array.from(groupIds)
      .map((id) => groupsMap[id])
      .filter(Boolean);
  }, [teacherAssignments, groupsMap]);

  // Фильтрация ответов для текущих оценок
  const filteredSubmissions = React.useMemo(() => {
    return allSubmissions.filter((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      const student = studentsMap[submission.studentId];

      if (!assignment || !student || !submission.isChecked) return false;

      // Фильтр по дисциплине
      if (
        selectedSubject !== "all" &&
        assignment.subjectId !== selectedSubject
      ) {
        return false;
      }

      // Фильтр по группе
      if (selectedGroup !== "all" && assignment.groupId !== selectedGroup) {
        return false;
      }

      // Поиск по имени студента
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!student.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [
    allSubmissions,
    selectedSubject,
    selectedGroup,
    searchTerm,
    assignmentsMap,
    studentsMap,
  ]);

  // Группировка оценок по студентам для текущих оценок
  const studentGrades = React.useMemo(() => {
    const gradesMap = new Map<
      string,
      {
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
      }
    >();

    filteredSubmissions.forEach((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      const student = studentsMap[submission.studentId];
      const subject = subjectsMap[assignment?.subjectId];
      const group = groupsMap[assignment?.groupId];

      if (!assignment || !student || !subject || !group) return;

      if (!gradesMap.has(student.$id)) {
        gradesMap.set(student.$id, {
          student,
          grades: [],
          totalScore: 0,
          maxScore: 0,
          averagePercentage: 0,
        });
      }

      const studentData = gradesMap.get(student.$id)!;
      studentData.grades.push({
        assignment,
        submission,
        subject,
        group,
      });
      studentData.totalScore += submission.score || 0;
      studentData.maxScore += assignment.maxScore;
    });

    // Вычисляем средний процент
    gradesMap.forEach((studentData) => {
      if (studentData.maxScore > 0) {
        studentData.averagePercentage =
          (studentData.totalScore / studentData.maxScore) * 100;
      }
    });

    return Array.from(gradesMap.values()).sort(
      (a, b) => b.averagePercentage - a.averagePercentage
    );
  }, [
    filteredSubmissions,
    assignmentsMap,
    studentsMap,
    subjectsMap,
    groupsMap,
  ]);

  // Данные для финальных оценок
  const finalGradesData = React.useMemo((): FinalGradeData[] => {
    if (viewMode !== "final") return [];

    // Группируем данные по комбинациям студент + предмет + группа
    const combinations = teacherAssignments
      .map((assignment) => {
        const subject = subjectsMap[assignment.subjectId];
        const group = groupsMap[assignment.groupId];

        if (!subject || !group || !group.studentIds) return null;

        return group.studentIds
          .map((studentId) => {
            const student = studentsMap[studentId];
            if (!student) return null;

            // Находим существующую финальную оценку
            const existingGrade = finalGrades.find(
              (fg) =>
                fg.studentId === studentId &&
                fg.subjectId === assignment.subjectId &&
                fg.groupId === assignment.groupId
            );

            // Вычисляем текущие баллы студента по данному предмету и группе
            const studentSubmissions = allSubmissions.filter((sub) => {
              const assignmentData = assignmentsMap[sub.assignmentId];
              return (
                assignmentData &&
                assignmentData.subjectId === assignment.subjectId &&
                assignmentData.groupId === assignment.groupId &&
                sub.studentId === studentId &&
                sub.isChecked
              );
            });

            const totalScore = studentSubmissions.reduce(
              (sum, sub) => sum + (sub.score || 0),
              0
            );
            const maxScore = studentSubmissions.reduce((sum, sub) => {
              const assignmentData = assignmentsMap[sub.assignmentId];
              return sum + (assignmentData?.maxScore || 0);
            }, 0);

            // Вычисляем посещаемость для данной группы и предмета
            const subjectLessons = allLessons.filter(
              (lesson) =>
                lesson.subjectId === assignment.subjectId &&
                lesson.groupId === assignment.groupId
            );

            const lessonIds = subjectLessons.map((l) => l.$id);
            const studentAttendance = allAttendance.filter(
              (att) =>
                att.studentId === studentId && lessonIds.includes(att.lessonId)
            );

            const totalLessons = subjectLessons.length;
            const attendedLessons = studentAttendance.filter(
              (att) => att.present
            ).length;

            const currentPercentage =
              maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
            const currentLetterGrade = getLetterGrade(currentPercentage);

            const key = `${studentId}-${assignment.subjectId}-${assignment.groupId}`;

            return {
              key,
              student,
              subject,
              group,
              currentScore: totalScore,
              maxHomeworkScore: maxScore,
              currentLetterGrade,
              totalLessons,
              attendedLessons,
              finalScore:
                editingGrades[key]?.score ??
                existingGrade?.totalScore ??
                totalScore,
              finalLetterGrade:
                editingGrades[key]?.letterGrade ??
                existingGrade?.letterGrade ??
                currentLetterGrade,
              hasExistingGrade: !!existingGrade,
            };
          })
          .filter(Boolean);
      })
      .flat()
      .filter(Boolean);

    return combinations.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t!.key === item!.key)
    ) as FinalGradeData[];
  }, [
    teacherAssignments,
    subjectsMap,
    groupsMap,
    studentsMap,
    finalGrades,
    allSubmissions,
    allLessons,
    allAttendance,
    assignmentsMap,
    editingGrades,
    viewMode,
  ]);

  // Статистика
  const stats = React.useMemo(() => {
    if (viewMode === "final") {
      const totalCombinations = finalGradesData.length;
      const gradedCombinations = finalGradesData.filter(
        (item) => item.hasExistingGrade
      ).length;
      const averageScore =
        finalGradesData.reduce((sum, item) => sum + item.finalScore, 0) /
          totalCombinations || 0;
      const excellentCount = finalGradesData.filter(
        (item) => item.finalLetterGrade === "отлично"
      ).length;

      return {
        totalStudents: new Set(finalGradesData.map((item) => item.student.$id))
          .size,
        totalGrades: totalCombinations,
        gradedCount: gradedCombinations,
        averagePercentage: Math.round(averageScore),
        excellentCount,
      };
    } else {
      const checkedSubmissions = allSubmissions.filter((s) => s.isChecked);
      const totalScore = checkedSubmissions.reduce(
        (sum, s) => sum + (s.score || 0),
        0
      );
      const maxPossibleScore = checkedSubmissions.reduce((sum, s) => {
        const assignment = assignmentsMap[s.assignmentId];
        return sum + (assignment?.maxScore || 0);
      }, 0);

      const averagePercentage =
        maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      const excellentCount = checkedSubmissions.filter((s) => {
        const assignment = assignmentsMap[s.assignmentId];
        const percentage = assignment
          ? ((s.score || 0) / assignment.maxScore) * 100
          : 0;
        return percentage >= 87;
      }).length;

      return {
        totalStudents: new Set(filteredSubmissions.map((s) => s.studentId))
          .size,
        totalGrades: checkedSubmissions.length,
        gradedCount: checkedSubmissions.length,
        averagePercentage: Math.round(averagePercentage),
        excellentCount,
      };
    }
  }, [
    viewMode,
    finalGradesData,
    allSubmissions,
    filteredSubmissions,
    assignmentsMap,
  ]);

  const handleEditGrade = (key: string, score: number) => {
    const letterGrade = getLetterGrade(score);
    setEditingGrades((prev) => ({
      ...prev,
      [key]: { score, letterGrade },
    }));
  };

  const handleSaveGrade = (item: FinalGradeData) => {
    const editing = editingGrades[item.key];
    const scoreToSave = editing?.score ?? item.finalScore;
    const letterGradeToSave = editing?.letterGrade ?? item.finalLetterGrade;

    saveFinalGradeMutation.mutate({
      studentId: item.student.$id,
      subjectId: item.subject.$id,
      groupId: item.group.$id,
      totalScore: scoreToSave,
      letterGrade: letterGradeToSave,
    });

    // Убираем из редактирования после сохранения
    setEditingGrades((prev) => {
      const newState = { ...prev };
      delete newState[item.key];
      return newState;
    });
  };

  const handleCancelEdit = (key: string) => {
    setEditingGrades((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  // Инициализируем значения для всех студентов при изменении данных
  React.useEffect(() => {
    finalGradesData.forEach((item) => {
      if (!editingGrades[item.key]) {
        const letterGrade = getLetterGrade(item.finalScore);
        setEditingGrades((prev) => ({
          ...prev,
          [item.key]: { score: item.finalScore, letterGrade },
        }));
      }
    });
  }, [finalGradesData.length]); // Используем length вместо всего массива

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Оценки студентов
            </h1>
            <p className="text-gray-600">
              Просматривайте и управляйте оценками студентов по вашим
              дисциплинам
            </p>
          </div>

          {/* Переключатель режимов */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("current")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === "current"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Текущие оценки
            </button>
            <button
              onClick={() => setViewMode("final")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === "final"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Финальные оценки
            </button>
          </div>
        </div>

        {/* Информация о периоде */}
        {viewMode === "final" && (
          <div className="mb-4">
            <GradesPeriodInfo activePeriod={activePeriod} />
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="mb-6">
        <GradesStats stats={stats} viewMode={viewMode} />
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <GradesFilters
          searchTerm={searchTerm}
          selectedSubject={selectedSubject}
          selectedGroup={selectedGroup}
          teacherSubjects={teacherSubjects}
          teacherGroups={teacherGroups}
          onSearchChange={setSearchTerm}
          onSubjectChange={setSelectedSubject}
          onGroupChange={setSelectedGroup}
        />
      </div>

      {/* Контент в зависимости от режима */}
      {viewMode === "final" ? (
        <FinalGradesTable
          activePeriod={activePeriod}
          finalGradesData={finalGradesData}
          editingGrades={editingGrades}
          selectedSubject={selectedSubject}
          selectedGroup={selectedGroup}
          searchTerm={searchTerm}
          saveFinalGradeMutation={saveFinalGradeMutation}
          onEditGrade={handleEditGrade}
          onSaveGrade={handleSaveGrade}
        />
      ) : (
        <CurrentGradesView
          studentGrades={studentGrades}
          searchTerm={searchTerm}
          selectedSubject={selectedSubject}
          selectedGroup={selectedGroup}
        />
      )}
    </div>
  );
}
