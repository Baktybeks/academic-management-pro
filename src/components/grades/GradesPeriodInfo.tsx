// src/components/grades/GradesPeriodInfo.tsx

import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { GradingPeriod } from "@/types";
import { formatLocalDate } from "@/utils/dateUtils";

interface GradesPeriodInfoProps {
  activePeriod: GradingPeriod | undefined;
}

export function GradesPeriodInfo({ activePeriod }: GradesPeriodInfoProps) {
  if (activePeriod) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">{activePeriod.title}</h3>
            <p className="text-sm text-blue-700">
              Период: {formatLocalDate(activePeriod.startDate)} -{" "}
              {formatLocalDate(activePeriod.endDate)}
            </p>
            {activePeriod.description && (
              <p className="text-sm text-blue-600 mt-1">
                {activePeriod.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-900">
            Нет активного периода оценок
          </h3>
          <p className="text-sm text-yellow-700">
            Обратитесь к супер администратору для активации периода выставления
            финальных оценок
          </p>
        </div>
      </div>
    </div>
  );
}
