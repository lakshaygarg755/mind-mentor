import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongoDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Note from "@/models/note";

// Get all notes for the user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId') || null;

    await connectMongoDB();
    
    const notes = await Note.find({
      userId: session.user.id,
      parentId,
      isArchived: false
    }).sort({ updatedAt: -1 });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Create a new note
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectMongoDB();

    // Create note with proper content structure
    const note = new Note({
      userId: session.user.id,
      title: data.title || 'Untitled',
      content: [{
        type: 'paragraph',
        content: data.content || ''
      }],
      parentId: data.parentId || null
    });

    await note.save();
    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
} 