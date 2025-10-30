import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DailyTask {
  day: string;
  tasks: string[];
  duration: string;
}

interface WeeklyPlan {
  week: string;
  goals: string[];
  dailyTasks: DailyTask[];
}

interface StudyPlan {
  overview: {
    subject: string;
    duration: string;
    examDate: string;
  };
  weeklyPlans: WeeklyPlan[];
  recommendations: string[];
}

interface StudyPlanDisplayProps {
  plan: StudyPlan;
}

export default function StudyPlanDisplay({ plan }: StudyPlanDisplayProps) {
  return (
    <Card className="w-full bg-white border-2 border-black rounded-xl">
      <CardHeader className="border-b-2 border-black p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800 break-words">
          Study Plan for {plan.overview.subject}
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm sm:text-base text-gray-600">
          <span>Duration: {plan.overview.duration}</span>
          <span className="hidden sm:inline">|</span>
          <span>Exam Date: {plan.overview.examDate}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ScrollArea className="h-[calc(100vh-200px)] sm:h-[calc(100vh-220px)] w-full pr-2 sm:pr-4">
          {plan.weeklyPlans.map((weeklyPlan, weekIndex) => (
            <div key={weekIndex} className="mb-8 sm:mb-12 last:mb-0">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 border-b pb-2">
                {weeklyPlan.week}
              </h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Goals:</h4>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-sm sm:text-base">
                  {weeklyPlan.goals.map((goal, index) => (
                    <li key={index} className="text-gray-600">{goal}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Daily Schedule:</h4>
                {weeklyPlan.dailyTasks.map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-3">
                    <h5 className="font-medium text-gray-600 text-sm sm:text-base">
                      {day.day} ({day.duration})
                    </h5>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-sm sm:text-base">
                      {day.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="text-gray-600">{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 border-b pb-2">
              Study Tips & Recommendations
            </h3>
            <ul className="list-disc pl-4 sm:pl-5 space-y-2 text-sm sm:text-base">
              {plan.recommendations.map((tip, index) => (
                <li key={index} className="text-gray-600">{tip}</li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}