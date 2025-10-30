import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List all PDFs
export async function GET(req: NextRequest) {
  try {
    
    // Get the session token
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.id) {
      console.log('No authentication token or user ID found');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    
    try {
      // Forward the request with user ID in headers
      const response = await fetch(`${apiUrl}/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-user-id': token.id.toString(),
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        // Try to parse error response as JSON
        let errorMessage = 'Failed to fetch PDFs';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.log('Error data from backend:', errorData);
        } catch (parseError) {
          console.log('Failed to parse error response:', parseError);
          // If parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data.pdfs || []);
    } catch (fetchError) {
      console.error('Error making backend request:', fetchError);
      return NextResponse.json(
        { error: 'Failed to communicate with PDF service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in PDF fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Upload PDF
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
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
    
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/pdf/upload`, {
      method: 'POST',
      headers: {
        'X-User-Id': token.sub || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to upload PDF');
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

// Delete PDF
export async function DELETE(req: NextRequest) {
  try {
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

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/pdf/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-Id': token.sub || '',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete PDF');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting PDF:', err);
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to delete PDF' },
      { status: 500 }
    );
  }
} 