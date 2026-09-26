import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * Health Endpoint
 * Public: Returns ONLY {"status":"available"} (or {"status":"unavailable"} on failure).
 * Admin (with authorization): Returns internal diagnostics.
 */
export async function GET(req: NextRequest) {
  const modelPath = path.join(process.cwd(), 'ml', 'models', 'urgency_model.joblib');
  const isAvailable = fs.existsSync(modelPath);

  // Check for authenticated server/admin authorization
  const authHeader = req.headers.get('authorization') || '';
  const adminKey = req.headers.get('x-admin-key') || '';
  const expectedSecret = process.env.TRIAGE_ML_SERVICE_SECRET;

  const isAuthorized =
    expectedSecret &&
    (authHeader === `Bearer ${expectedSecret}` || adminKey === expectedSecret);

  // If authenticated as admin, return detailed operational telemetry
  if (isAuthorized) {
    const isShadowEnabled = process.env.TRIAGE_ML_SHADOW_ENABLED === 'true';
    return NextResponse.json({
      status: isAvailable ? 'available' : 'unavailable',
      shadowModeEnabled: isShadowEnabled,
      modelLoaded: isAvailable,
      timestamp: new Date().toISOString(),
      authorized: true,
    });
  }

  // Strictly protected public response: reveals ONLY {"status":"available"}
  if (!isAvailable) {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  }

  return NextResponse.json({ status: 'available' });
}
