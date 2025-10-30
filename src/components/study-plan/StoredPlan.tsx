import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

export interface Task {
  day: string;
  tasks: string[];
  duration: string;
}

export interface WeeklyPlan {
  week: string;
  goals: string[];
  dailyTasks: Task[];
}

export interface Overview {
  subject: string;
  duration: string;
  examDate: string;
}

export interface StudyPlan {
  _id: string;
  overview: Overview;
  weeklyPlans: WeeklyPlan[];
  recommendations: string[];
  isActive: boolean;
  progress: number;
}

interface StoredPlanProps {
  plan: StudyPlan;
  onDelete: (planId: string) => void;
}

export function StoredPlan({ plan, onDelete }: StoredPlanProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteStudyPlan(plan._id);
      onDelete(plan._id);
      toast({
        variant: "success",
        title: "Success",
        description: "Study plan deleted successfully",
      });
    } catch {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to delete study plan",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full mt-4 sm:mt-8">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto">
          <CardTitle className="text-xl sm:text-2xl font-bold break-words">
            Study Plan for {plan.overview.subject}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs sm:text-sm">{plan.overview.duration}</Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">Exam: {plan.overview.examDate}</Badge>
            <Badge variant={plan.isActive ? "default" : "secondary"} className="text-xs sm:text-sm">
              {plan.isActive ? "Active" : "Completed"}
            </Badge>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting} className="w-full sm:w-auto hover:bg-red-500">
              Delete Plan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[95vw] max-w-md sm:w-full">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your study plan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto hover:bg-red-500">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {plan.weeklyPlans.map((weekPlan, index) => (
            <AccordionItem key={index} value={`week-${index}`}>
              <AccordionTrigger className="text-base sm:text-lg font-semibold">
                {weekPlan.week}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm sm:text-base">
                  <div>
                    <h4 className="font-semibold mb-2">Goals:</h4>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1">
                      {weekPlan.goals.map((goal, idx) => (
                        <li key={idx} className="break-words">{goal}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Daily Tasks:</h4>
                    {weekPlan.dailyTasks.map((day, dayIdx) => (
                      <div key={dayIdx} className="mb-4">
                        <h5 className="font-medium">{day.day} ({day.duration})</h5>
                        <ul className="list-disc pl-4 sm:pl-5 space-y-1">
                          {day.tasks.map((task, taskIdx) => (
                            <li key={taskIdx} className="break-words">{task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          <AccordionItem value="recommendations">
            <AccordionTrigger className="text-base sm:text-lg font-semibold">
              Recommendations
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-sm sm:text-base">
                {plan.recommendations.map((rec, index) => (
                  <li key={index} className="break-words">{rec}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}