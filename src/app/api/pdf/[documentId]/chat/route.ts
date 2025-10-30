import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const apiUrl = process.env.API_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID is required' },
        { status: 401 }
      );
    }

    const { documentId } = params;
    const body = await request.json();

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch(`${apiUrl}/pdf/${documentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || 'Failed to process chat request' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - PDF processing is taking longer than expected. Please try again.' },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in PDF chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 