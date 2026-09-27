import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('docId');
  const expires = searchParams.get('expires');
  const sig = searchParams.get('sig');

  if (!docId || !expires || !sig) {
    return NextResponse.json(
      { error: 'Missing document signature parameters' },
      { status: 400 }
    );
  }

  // Validate expiry
  const expiresAt = parseInt(expires, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return NextResponse.json(
      { error: 'Signed document URL has expired. Please refresh the page to generate a new secure link.' },
      { status: 403 }
    );
  }

  // Validate signature token
  try {
    const decoded = Buffer.from(sig, 'base64').toString('utf8');
    const [tokenDocId] = decoded.split(':');
    if (tokenDocId !== docId) {
      return NextResponse.json(
        { error: 'Invalid document signature' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Malformed document signature' },
      { status: 403 }
    );
  }

  // Return secure response header preventing unauthorized caching
  return new NextResponse(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000098 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`,
    {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="health_document_${docId}.pdf"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}
