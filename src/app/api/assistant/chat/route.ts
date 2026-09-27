import { NextRequest, NextResponse } from 'next/server';
import {
  processSridaMessage,
  sanitizeUserInput,
  isPromptInjection,
  SridaLocale,
  SRIDA_DISCLAIMERS,
} from '@/lib/srida-engine';

// In-memory rate limiting map: ip -> { count, timestamp }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Identify client for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-client';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before sending more messages.',
          answer:
            'You are sending requests too quickly. Please pause for a moment before asking Srida again.',
          source: 'FALLBACK',
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { message, locale = 'en', currentRoute } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message provided.' },
        { status: 400 }
      );
    }

    const safeLocale: SridaLocale =
      locale === 'hi' || locale === 'or' ? locale : 'en';

    // 3. Sanitize input (strip HTML, script tags, Aadhaar 12-digit numbers, phone numbers)
    const sanitized = sanitizeUserInput(message);

    // 4. Prompt injection detection
    if (isPromptInjection(sanitized)) {
      return NextResponse.json({
        answer:
          safeLocale === 'hi'
            ? 'मैं एक सुरक्षित TriageBridge सहायक हूँ। मैं केवल स्वीकृत प्लेटफ़ॉर्म मार्गदर्शन प्रदान कर सकती हूँ।'
            : safeLocale === 'or'
            ? 'ମୁଁ ଏକ ସୁରକ୍ଷିତ TriageBridge ସହାୟକ। ମୁଁ କେବଳ ଅନୁମୋଦିତ ପ୍ଲାଟଫର୍ମ ମାର୍ଗଦର୍ଶନ ପ୍ରଦାନ କରିପାରିବି।'
            : 'I am Srida, your safe TriageBridge guide. I only provide verified platform assistance and cannot fulfill system override requests.',
        source: 'FALLBACK',
        isEmergency: false,
        isMedicalRefusal: false,
        permanentNotice: SRIDA_DISCLAIMERS.PERMANENT_NOTICE[safeLocale],
        appWideDisclaimer: SRIDA_DISCLAIMERS.APP_WIDE_DISCLAIMER[safeLocale],
        syntheticDemoNotice: SRIDA_DISCLAIMERS.SYNTHETIC_DEMO[safeLocale],
      });
    }

    // 5. Process query through Srida Engine
    // Follows the safe hierarchy:
    // 1. Prompt injection neutralization
    // 2. Medical diagnosis & prescription refusal
    // 3. Emergency safety check
    // 4. Verified FAQ knowledge base search
    // 5. Safe human-support fallback
    const result = processSridaMessage(sanitized, safeLocale);

    return NextResponse.json({
      answer: result.answer,
      source: result.source,
      relatedRoute: result.relatedRoute,
      actionButtonLabel: result.actionButtonLabel,
      secondaryActions: result.secondaryActions,
      isEmergency: result.isEmergency,
      isMedicalRefusal: result.isMedicalRefusal,
      faqId: result.faqId,
      suggestedFaqs: result.suggestedFaqs,
      permanentNotice: SRIDA_DISCLAIMERS.PERMANENT_NOTICE[safeLocale],
      appWideDisclaimer: SRIDA_DISCLAIMERS.APP_WIDE_DISCLAIMER[safeLocale],
      syntheticDemoNotice: SRIDA_DISCLAIMERS.SYNTHETIC_DEMO[safeLocale],
    });
  } catch (error) {
    // Sanitized technical logging only — no patient data in logs
    console.error('[SridaChatAPI] Request processing error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      {
        answer:
          'I’m unable to process your request right now. Please verify your connection or try again later.',
        source: 'FALLBACK',
        isEmergency: false,
        isMedicalRefusal: false,
      },
      { status: 500 }
    );
  }
}
