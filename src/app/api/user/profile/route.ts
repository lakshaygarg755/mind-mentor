import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { authOptions } from "@/lib/auth";

// Define expected request body type
interface UpdateProfileRequest {
  name: string;
  // Add other fields you want to make updatable
  bio?: string;
  timezone?: string;
}

export async function PUT(req: Request) {
  try {
    // 1. Validate Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    // 2. Get and validate request data
    const data = await req.json() as UpdateProfileRequest;
    if (!data.name?.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectMongoDB();

    // 4. Find and update user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 5. Update user fields
    user.name = data.name.trim();
    if (data.bio) user.bio = data.bio.trim();
    if (data.timezone) user.timezone = data.timezone;

    // 6. Save changes
    await user.save();

    // 7. Return updated user data
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio,
        timezone: user.timezone,
        updatedAt: user.updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch profile data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
} 