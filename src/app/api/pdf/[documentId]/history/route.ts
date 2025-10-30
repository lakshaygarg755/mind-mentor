import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const documentId = params.documentId;
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/pdf/${documentId}/history`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': token.sub || '',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch chat history');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Error retrieving chat history' },
      { status: 500 }
    );
  }
} 