import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // Get the session token
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('pdf');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create a new FormData instance for the backend request
    const backendFormData = new FormData();
    backendFormData.append('pdf', file);

    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/pdf/upload`, {
      method: 'POST',
      headers: {
        'X-User-Id': token.sub || '',
      },
      body: backendFormData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload PDF';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error uploading PDF:', err);
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to upload PDF' },
      { status: 500 }
    );
  }
} 