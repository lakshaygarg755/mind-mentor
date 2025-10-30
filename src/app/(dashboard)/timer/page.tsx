"use client"

import { StudyTimer } from "@/components/timer/StudyTimer";

export default function TimerPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Study Timer</h1>
        <span className="text-xs sm:text-sm text-gray-600">
          Track your focus sessions
        </span>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <StudyTimer />
      </div>
    </div>
  );
}