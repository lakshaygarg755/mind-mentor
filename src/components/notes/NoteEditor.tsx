"use client"

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Note {
  _id?: string;
  title: string;
  content: string;
}

interface NoteEditorProps {
  note: Note | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(note?.title || 'Untitled');
  const [content, setContent] = useState(note?.content || '');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
    }
  }, [note]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const url = note?._id ? `/api/notes/${note._id}` : '/api/notes';
      const method = note?._id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          content
        }),
      });

      if (!response.ok) throw new Error('Failed to save note');

      toast({
        variant: "success",
        title: "Success",
        description: "Note saved successfully",
      });

      onSave();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to save note",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="text-xl font-bold"
      />
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your note here..."
        className="w-full h-[calc(100vh-20rem)] p-4 border bg-[#EFE9D5] rounded resize-none focus:outline-none"
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </div>
  );
} 