import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import StudyStats from "@/models/studyStats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { duration, startTime, endTime, mode } = await req.json();
    const date = new Date(endTime).toISOString().split('T')[0];

    await connectMongoDB();
    
    // Find or create study stats for user
    let studyStats = await StudyStats.findOne({ userId: session.user.id });
    
    if (!studyStats) {
      studyStats = new StudyStats({
        userId: session.user.id,
        dailySessions: new Map()
      });
    }

    // Get or initialize today's sessions
    let todaysSessions = studyStats.dailySessions.get(date);
    if (!todaysSessions) {
      todaysSessions = {
        count: 0,
        totalDuration: 0,
        sessions: []
      };
    }

    // Add new session
    todaysSessions.sessions.push({
      duration,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      mode
    });
    todaysSessions.count += 1;
    todaysSessions.totalDuration += duration;

    // Update daily sessions
    studyStats.dailySessions.set(date, todaysSessions);

    // Update overall stats
    studyStats.totalStudyHours += duration / 3600;
    studyStats.completedSessions += 1;
    studyStats.lastStudyDate = new Date(endTime);

    // Calculate streak
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (studyStats.dailySessions.get(yesterdayStr)) {
      studyStats.currentStreak += 1;
    } else {
      studyStats.currentStreak = 1;
    }

    // Update best streak
    if (studyStats.currentStreak > studyStats.bestStreak) {
      studyStats.bestStreak = studyStats.currentStreak;
    }

    // Mark as modified and save
    studyStats.markModified('dailySessions');
    await studyStats.save();

    return NextResponse.json({
      message: "Study session recorded successfully",
      stats: {
        currentStreak: studyStats.currentStreak,
        bestStreak: studyStats.bestStreak,
        totalStudyHours: studyStats.totalStudyHours,
        completedSessions: studyStats.completedSessions,
        todaysSessions: studyStats.dailySessions.get(date)
      }
    });

  } catch (error) {
    console.error("Error recording study session:", error);
    return NextResponse.json(
      { error: "Failed to record study session" },
      { status: 500 }
    );
  }
} 