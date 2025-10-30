"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { File, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  parentId: string | null;
}

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onRefresh: () => void;
}

export default function NotesList({ notes, selectedNote, onSelectNote, onRefresh }: NotesListProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (noteId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      toast({
        variant: "success",
        title: "Success",
        description: "Note deleted successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to delete note",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
        <File className="h-8 w-8 mb-2" />
        <p>No notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note._id}
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-[#F5F1EA] ${
            selectedNote?._id === note._id ? 'bg-[#F5F1EA]' : ''
          }`}
          onClick={() => onSelectNote(note)}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">{note.title || 'Untitled'}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note._id);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}