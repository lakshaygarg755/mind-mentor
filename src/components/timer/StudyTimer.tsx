"use client"

import { useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTimerStore } from '@/store/timerStore';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export function StudyTimer() {
  const { toast } = useToast();
  const timer = useTimerStore();

  const handleSessionComplete = useCallback(async () => {
    if (timer.mode === 'focus') {
      try {
        const startTime = new Date(Date.now() - (timer.focusTime * 60 * 1000));
        const endTime = new Date();
        
        const response = await fetch('/api/study-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: timer.focusTime * 60,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            mode: 'focus'
          }),
        });

        if (!response.ok) throw new Error('Failed to save session');
        const data = await response.json();

        toast({
          variant: "success",
          title: "Focus Session Complete! 🎉",
          description: `Current streak: ${data.stats.currentStreak} days! Time for a break.`,
          duration: 5000,
        });

        window.dispatchEvent(new CustomEvent('study-session-completed'));
        
        // Switch to break mode
        timer.setMode('break');
        timer.setTimeLeft(timer.breakTime * 60);
        timer.setProgress(0);
      } catch (error) {
        console.error('Error saving session:', error);
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to save your study session",
          duration: 5000,
        });
      }
    } else {
      toast({
        variant: "success",
        title: "Break Time Over",
        description: "Ready for another focus session?",
        duration: 5000,
      });
      
      // Switch to focus mode
      timer.setMode('focus');
      timer.setTimeLeft(timer.focusTime * 60);
      timer.setProgress(0);
    }
  }, [timer, toast]);

  // Timer tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer.isActive) {
        timer.tick();

        // Check for completion
        if (timer.timeLeft <= 0) {
          timer.setIsActive(false);
          handleSessionComplete();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timer, timer.isActive, handleSessionComplete]);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    timer.reset();
  };

  const handleModeSwitch = () => {
    if (!timer.isActive) {
      timer.setMode(timer.mode === 'focus' ? 'break' : 'focus');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 sm:p-6">
        <div 
          className={cn(
            "relative p-4 sm:p-8 rounded-lg cursor-pointer transition-colors",
            timer.mode === 'focus' 
              ? "bg-[#EFE9D5] hover:bg-[#F5F1EA]" 
              : "bg-[#EFE9D5] hover:bg-[#F5F1EA]"
          )}
          onClick={handleModeSwitch}
        >
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {timer.mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </h2>
            <div className="text-5xl sm:text-6xl font-mono font-bold">
              {formatTime(timer.timeLeft)}
            </div>
          </div>

          <div className="flex justify-center gap-3 sm:gap-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                timer.setIsActive(!timer.isActive);
              }}
              variant={timer.isActive ? "destructive" : "default"}
              className="text-sm sm:text-base"
            >
              {timer.isActive ? "Pause" : "Start"}
            </Button>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="text-sm sm:text-base"
            >
              Reset
            </Button>
          </div>

          <Progress 
            value={timer.progress} 
            className={cn(
              "mt-4",
              timer.mode === 'focus' ? "[&>div]:bg-green-600" : "[&>div]:bg-blue-600"
            )}
          />
        </div>

        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <div>
            <Label className="text-sm sm:text-base">Focus Duration (minutes)</Label>
            <Select
              value={timer.focusTime.toString()}
              onValueChange={(value) => {
                timer.setFocusTime(parseInt(value));
                if (timer.mode === 'focus') {
                  timer.setTimeLeft(parseInt(value) * 60);
                }
              }}
              disabled={timer.isActive}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 25, 30, 45, 60].map((time) => (
                  <SelectItem key={time} value={time.toString()}>
                    {time} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm sm:text-base">Break Duration (minutes)</Label>
            <Select
              value={timer.breakTime.toString()}
              onValueChange={(value) => {
                timer.setBreakTime(parseInt(value));
                if (timer.mode === 'break') {
                  timer.setTimeLeft(parseInt(value) * 60);
                }
              }}
              disabled={timer.isActive}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map((time) => (
                  <SelectItem key={time} value={time.toString()}>
                    {time} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}