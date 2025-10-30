export interface DailyTask {
  day: string;
  tasks: string[];
  duration: string;
}

export interface WeeklyPlan {
  week: string;
  goals: string[];
  dailyTasks: DailyTask[];
}

export interface StudyPlan {
  subject: string;
  duration: string;
  examDate: Date;
  weeklyPlans: WeeklyPlan[];
  recommendations: string[];
  createdAt: Date;
}

export interface Resource {
  title: string;
  description?: string;
  type: string;
  link: string;
  addedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  savedPlans: StudyPlan[];
  savedResources: Resource[];
  profile: {
    avatar?: string;
    bio?: string;
    timezone?: string;
    preferences: {
      emailNotifications: boolean;
      studyReminders: boolean;
    };
  };
  stats: {
    totalStudyHours: number;
    completedTasks: number;
    currentStreak: number;
    lastStudyDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
} 