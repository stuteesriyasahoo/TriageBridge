/**
 * @deprecated Obsolete assistant implementation 'Sriya'.
 * The authoritative patient guidance and safety engine is 'Srida' in src/lib/srida-engine.ts.
 * This file is maintained strictly for backward compatibility with existing tests and references.
 */

import {
  SridaLocale,
  SridaActionButton,
  SridaEngineResult,
  RouteGuidanceTip,
  SRIDA_DISCLAIMERS,
  SRIDA_GREETINGS,
  MEDICAL_REFUSAL_RESPONSES,
  EMERGENCY_RESPONSES,
  FALLBACK_RESPONSES,
  ONBOARDING_WELCOME_BUBBLE,
  GUIDED_NAVIGATION_ACTIONS,
  APP_TOUR_STEPS,
  TourStep,
  GuidedNavItem,
  sanitizeUserInput,
  isPromptInjection,
  isEmergencyQuery,
  isMedicalInquiry,
  searchVerifiedFaq,
  processSridaMessage,
  getRouteContextGuidance,
  getFaqsByCategory,
  getSuggestedFaqsForCategory,
  getFaqById,
} from './srida-engine';

export type SriyaLocale = SridaLocale;
export type SriyaActionButton = SridaActionButton;
export type SriyaEngineResult = SridaEngineResult;
export type { RouteGuidanceTip, TourStep, GuidedNavItem };

export const SRIYA_DISCLAIMERS = SRIDA_DISCLAIMERS;
export const SRIYA_GREETINGS = SRIDA_GREETINGS;
export {
  MEDICAL_REFUSAL_RESPONSES,
  EMERGENCY_RESPONSES,
  FALLBACK_RESPONSES,
  ONBOARDING_WELCOME_BUBBLE,
  GUIDED_NAVIGATION_ACTIONS,
  APP_TOUR_STEPS,
  sanitizeUserInput,
  isPromptInjection,
  isEmergencyQuery,
  isMedicalInquiry,
  searchVerifiedFaq,
  getRouteContextGuidance,
  getFaqsByCategory,
  getSuggestedFaqsForCategory,
  getFaqById,
};

/**
 * @deprecated Use processSridaMessage from '@/lib/srida-engine' instead.
 */
export const processSriyaMessage = processSridaMessage;
