import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * Model Version Endpoint
 * Access Control: Strictly requires server/admin authorization.
 * Public requests are denied with 401 Unauthorized to prevent reconnaissance.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const adminKey = req.headers.get('x-admin-key') || '';
  const expectedSecret = process.env.TRIAGE_ML_SERVICE_SECRET;

  const isAuthorized =
    expectedSecret &&
    (authHeader === `Bearer ${expectedSecret}` || adminKey === expectedSecret);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized: Administrator access required to view model metadata' },
      { status: 401 }
    );
  }

  const metadataPath = path.join(process.cwd(), 'ml', 'models', 'model_metadata.json');
  let modelVersion = '1.0.0-synthetic-prototype';
  let datasetHash = 'bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f';

  if (fs.existsSync(metadataPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      modelVersion = data.model_version || modelVersion;
      datasetHash = data.dataset_sha256 || datasetHash;
    } catch {
      // Safe fallback
    }
  }

  return NextResponse.json({
    modelVersion,
    datasetHash,
    isClinicallyValidated: false,
    syntheticOnly: true,
    shadowModePolicy: 'SILENT_TECHNICAL_EVALUATION_ONLY',
    warning: 'Experimental AI model based on synthetic records. Not clinically validated.',
  });
}
