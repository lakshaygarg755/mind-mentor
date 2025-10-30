"use client"

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, File } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import NoteEditor from '@/components/notes/NoteEditor';
import NotesList from '@/components/notes/NotesList';
import PacmanLoader from 'react-spinners/PacmanLoader';

interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  parentId: string | null;
}

interface NoteData {
  _id: string;
  title: string;
  content: Array<{ type: string; content: string }>;
  updatedAt: string;
  parentId: string | null;
}

export default function NotesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      // Convert content array to string
      const formattedNotes = data.map((note: NoteData) => ({
        ...note,
        content: Array.isArray(note.content) ? note.content[0]?.content || '' : note.content || ''
      }));
      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load notes",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, session]);

  const createNewNote = async () => {
    setIsCreating(true);
    setSelectedNote(null);
    setShowSidebar(false);
  };

  if (loading) {
    return <div className="fixed inset-0 flex items-center justify-center">
      <PacmanLoader color="#538B81" />
    </div>
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Notes</h1>
        <div className="flex gap-2">
          <Button 
            className="md:hidden"
            onClick={() => setShowSidebar(!showSidebar)}
            variant="outline"
          >
            {showSidebar ? 'Hide Notes' : 'Show Notes'}
          </Button>
          <Button onClick={createNewNote}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Note</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Notes List Sidebar */}
        <div className={`${showSidebar ? 'block' : 'hidden'} md:block md:col-span-3`}>
          <Card className="h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)] overflow-y-auto border-2 border-black rounded-lg">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl">Your Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <NotesList
                notes={notes}
                selectedNote={selectedNote}
                onSelectNote={(note: Note) => {
                  setSelectedNote(note);
                  setShowSidebar(false);
                }}
                onRefresh={fetchNotes}
              />
            </CardContent>
          </Card>
        </div>

        {/* Editor Area */}
        <div className={`${showSidebar ? 'hidden' : 'block'} md:block md:col-span-9`}>
          <Card className="h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)] overflow-y-auto border-2 border-black rounded-lg">
            <CardContent className="p-4 sm:p-6">
              {isCreating || selectedNote ? (
                <NoteEditor
                  note={selectedNote}
                  onSave={async () => {
                    await fetchNotes();
                    setIsCreating(false);
                  }}
                  onCancel={() => {
                    setIsCreating(false);
                    setSelectedNote(null);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <File className="h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4" />
                  <p className="text-sm sm:text-base text-center">Select a note or create a new one</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}