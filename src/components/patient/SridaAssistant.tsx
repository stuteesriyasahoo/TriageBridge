'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  X,
  Minus,
  Send,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  ExternalLink,
  Phone,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Wifi,
  WifiOff,
  BookOpen,
  Compass,
  Navigation,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  SridaLocale,
  SRIDA_DISCLAIMERS,
  SRIDA_GREETINGS,
  getRouteContextGuidance,
  processSridaMessage,
  sanitizeUserInput,
  SridaActionButton,
  getFaqsByCategory,
  ONBOARDING_WELCOME_BUBBLE,
  GUIDED_NAVIGATION_ACTIONS,
  APP_TOUR_STEPS,
  TourStep,
} from '@/lib/srida-engine';
import {
  VERIFIED_FAQ_DATABASE,
  FaqCategory,
  VerifiedFaqEntry,
} from '@/lib/srida-faq-kb';

interface ChatMessage {
  id: string;
  sender: 'user' | 'srida';
  text: string;
  timestamp: string;
  source?: 'VERIFIED_KB' | 'AI_GUIDANCE' | 'MEDICAL_REFUSAL' | 'EMERGENCY_SAFETY' | 'FALLBACK';
  relatedRoute?: string;
  actionButtonLabel?: string;
  secondaryActions?: SridaActionButton[];
  isEmergency?: boolean;
  isMedicalRefusal?: boolean;
  feedback?: 'helpful' | 'not_helpful' | null;
  faqId?: string;
  suggestedFaqs?: Array<{ id: string; question: string }>;
}

const FAQ_CATEGORIES: Array<{ key: FaqCategory; en: string; hi: string; or: string }> = [
  { key: 'GETTING_STARTED', en: 'Getting Started', hi: 'शुरुआत करें', or: 'ଆରମ୍ଭ କରନ୍ତୁ' },
  { key: 'TRIAGE_AND_CASE_STATUS', en: 'Triage & Case Status', hi: 'ट्राइएज एवं स्थिति', or: 'ଟ୍ରାଇଏଜ୍ ଏବଂ ସ୍ଥିତି' },
  { key: 'APPOINTMENTS', en: 'Appointments', hi: 'नियुक्तियाँ', or: 'ନିଯୁକ୍ତି' },
  { key: 'HEALTH_DOCUMENTS', en: 'Health Documents', hi: 'स्वास्थ्य दस्तावेज़', or: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ' },
  { key: 'OFFLINE_ACCESS', en: 'Offline Access', hi: 'ऑफ़लाइन पहुँच', or: 'ଅଫଲାଇନ୍ ପ୍ରବେଶ' },
  { key: 'PRIVACY_AND_SECURITY', en: 'Privacy & Security', hi: 'गोपनीयता एवं सुरक्षा', or: 'ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା' },
  { key: 'EMERGENCY_HELP', en: 'Emergency Help', hi: 'आपातकालीन सहायता', or: 'ଜରୁରୀକାଳୀନ ସହାୟତା' },
];

export function SridaAssistant() {
  const { currentUser, role } = useAuth();
  const { locale: appLocale } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  // Assistant open/minimized state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Active view tab: 'chat' | 'faqs' | 'navigation'
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'navigation'>('chat');

  // Chatbot active language: default to app locale if en/hi/or, else en
  const [sridaLocale, setSridaLocale] = useState<SridaLocale>(() => {
    if (appLocale === 'hi') return 'hi';
    if (appLocale === 'or') return 'or';
    return 'en';
  });

  // Synchronize Srida's active language immediately when app language is changed
  useEffect(() => {
    if (appLocale === 'hi') {
      setSridaLocale('hi');
    } else if (appLocale === 'or') {
      setSridaLocale('or');
    } else {
      setSridaLocale('en');
    }
  }, [appLocale]);

  // Offline status tracking
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Messages and input
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // FAQ browser state
  const [activeFaqCategory, setActiveFaqCategory] = useState<FaqCategory>('GETTING_STARTED');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Onboarding welcome bubble state
  const [showWelcomeBubble, setShowWelcomeBubble] = useState<boolean>(false);

  // Guided App Tour state (9 steps)
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentTourStepIndex, setCurrentTourStepIndex] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Monitor online/offline state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // 2. First-time onboarding bubble initialization
  useEffect(() => {
    if (!currentUser || role !== 'PATIENT') return;

    try {
      const bubbleKey = `tb_srida_onboarding_dismissed_${currentUser.id}`;
      const isDismissed = localStorage.getItem(bubbleKey);
      if (!isDismissed && !isOpen) {
        const timer = setTimeout(() => setShowWelcomeBubble(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable
    }
  }, [currentUser?.id, role, isOpen]);

  // 3. Patient chat state isolation by user ID
  useEffect(() => {
    if (!currentUser || role !== 'PATIENT') return;

    const storageKey = `tb_srida_chats_${currentUser.id}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // In case of corrupt storage, initialize fresh
    }

    // Default welcome message in active language
    const welcomeMsg: ChatMessage = {
      id: 'welcome-init',
      sender: 'srida',
      text: SRIDA_GREETINGS[sridaLocale],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'VERIFIED_KB',
    };
    setMessages([welcomeMsg]);
  }, [currentUser?.id, role, sridaLocale]);

  // 4. Save chat history to localStorage per patient
  useEffect(() => {
    if (!currentUser || role !== 'PATIENT' || messages.length === 0) return;
    const storageKey = `tb_srida_chats_${currentUser.id}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore quota errors silently
    }
  }, [messages, currentUser?.id, role]);

  // 5. Auto scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, activeTab]);

  // 6. Focus input when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, activeTab]);

  // Do not render outside patient portal or for non-patients
  if (role !== 'PATIENT' || !currentUser) {
    return null;
  }

  // Dismiss welcome bubble and remember dismissal
  const handleDismissBubble = () => {
    setShowWelcomeBubble(false);
    try {
      const bubbleKey = `tb_srida_onboarding_dismissed_${currentUser.id}`;
      localStorage.setItem(bubbleKey, 'true');
    } catch {
      // Ignore
    }
  };

  // Open Srida from bubble
  const handleBubbleClick = () => {
    handleDismissBubble();
    setIsOpen(true);
    setIsMinimized(false);
  };

  // Reset Onboarding Bubble (from settings/menu)
  const handleResetOnboarding = () => {
    try {
      const bubbleKey = `tb_srida_onboarding_dismissed_${currentUser.id}`;
      localStorage.removeItem(bubbleKey);
      setShowWelcomeBubble(true);
    } catch {
      // Ignore
    }
  };

  // Start or Restart App Tour (9 Steps)
  const handleStartTour = () => {
    setCurrentTourStepIndex(0);
    setIsTourActive(true);
    setIsOpen(false);
  };

  const handleNextTourStep = () => {
    if (currentTourStepIndex < APP_TOUR_STEPS.length - 1) {
      setCurrentTourStepIndex((prev) => prev + 1);
    } else {
      handleFinishTour();
    }
  };

  const handlePrevTourStep = () => {
    if (currentTourStepIndex > 0) {
      setCurrentTourStepIndex((prev) => prev - 1);
    }
  };

  const handleFinishTour = () => {
    setIsTourActive(false);
    try {
      const tourKey = `tb_srida_tour_completed_${currentUser.id}`;
      localStorage.setItem(tourKey, 'true');
    } catch {
      // Ignore
    }
  };

  // Clear chat history for this patient
  const handleClearChat = () => {
    if (confirm('Clear Srida chat history? This will delete saved questions for this account.')) {
      const storageKey = `tb_srida_chats_${currentUser.id}`;
      localStorage.removeItem(storageKey);
      const freshWelcome: ChatMessage = {
        id: `welcome-${Date.now()}`,
        sender: 'srida',
        text: SRIDA_GREETINGS[sridaLocale],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'VERIFIED_KB',
      };
      setMessages([freshWelcome]);
    }
  };

  // Change assistant language
  const handleLanguageChange = (lang: SridaLocale) => {
    setSridaLocale(lang);
    const langMsg: ChatMessage = {
      id: `lang-${Date.now()}`,
      sender: 'srida',
      text: SRIDA_GREETINGS[lang],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'VERIFIED_KB',
    };
    setMessages((prev) => [...prev, langMsg]);
  };

  // Process user submission
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputMessage;
    if (!rawText || !rawText.trim() || isProcessing) return;

    const cleanInput = sanitizeUserInput(rawText);
    setInputMessage('');
    setIsProcessing(true);
    setActiveTab('chat');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Check if offline: execute locally with Srida Engine
    if (!navigator.onLine) {
      const offlineResult = processSridaMessage(cleanInput, sridaLocale);
      const sridaMsg: ChatMessage = {
        id: `srida-${Date.now()}`,
        sender: 'srida',
        text: offlineResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: offlineResult.source,
        relatedRoute: offlineResult.relatedRoute,
        actionButtonLabel: offlineResult.actionButtonLabel,
        secondaryActions: offlineResult.secondaryActions,
        isEmergency: offlineResult.isEmergency,
        isMedicalRefusal: offlineResult.isMedicalRefusal,
        faqId: offlineResult.faqId,
        suggestedFaqs: offlineResult.suggestedFaqs,
      };
      setMessages((prev) => [...prev, sridaMsg]);
      setIsProcessing(false);
      return;
    }

    // Online: Call protected server-side API
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanInput,
          locale: sridaLocale,
          currentRoute: pathname,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      const sridaMsg: ChatMessage = {
        id: `srida-${Date.now()}`,
        sender: 'srida',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        relatedRoute: data.relatedRoute,
        actionButtonLabel: data.actionButtonLabel,
        secondaryActions: data.secondaryActions,
        isEmergency: data.isEmergency,
        isMedicalRefusal: data.isMedicalRefusal,
        faqId: data.faqId,
        suggestedFaqs: data.suggestedFaqs,
      };
      setMessages((prev) => [...prev, sridaMsg]);
    } catch {
      // Local engine fallback if server is unreachable
      const fallbackResult = processSridaMessage(cleanInput, sridaLocale);
      const sridaMsg: ChatMessage = {
        id: `srida-${Date.now()}`,
        sender: 'srida',
        text: fallbackResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: fallbackResult.source,
        relatedRoute: fallbackResult.relatedRoute,
        actionButtonLabel: fallbackResult.actionButtonLabel,
        secondaryActions: fallbackResult.secondaryActions,
        isEmergency: fallbackResult.isEmergency,
        isMedicalRefusal: fallbackResult.isMedicalRefusal,
        faqId: fallbackResult.faqId,
        suggestedFaqs: fallbackResult.suggestedFaqs,
      };
      setMessages((prev) => [...prev, sridaMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Feedback action (Helpful / Not Helpful)
  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not_helpful') => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        let suggestions: Array<{ id: string; question: string }> | undefined = msg.suggestedFaqs;
        if (feedback === 'not_helpful' && !suggestions) {
          suggestions = VERIFIED_FAQ_DATABASE.slice(0, 3).map((f) => ({
            id: f.id,
            question:
              sridaLocale === 'hi'
                ? f.questionHi
                : sridaLocale === 'or'
                ? f.questionOr
                : f.questionEn,
          }));
        }

        return {
          ...msg,
          feedback,
          suggestedFaqs: suggestions,
        };
      })
    );
  };

  // FAQ Item Click
  const handleSelectFaq = (faq: VerifiedFaqEntry) => {
    const question =
      sridaLocale === 'hi'
        ? faq.questionHi
        : sridaLocale === 'or'
        ? faq.questionOr
        : faq.questionEn;
    setActiveTab('chat');
    handleSendMessage(question);
  };

  // Route guidance helper
  const routeGuidance = getRouteContextGuidance(pathname, sridaLocale);

  // Synthetic demo questions
  const syntheticDemoPills = [
    {
      id: 'demo-en',
      label: 'English: Appointments',
      query: 'Where can I find my appointment letter?',
    },
    {
      id: 'demo-hi',
      label: 'हिन्दी: रिपोर्ट अपलोड',
      query: 'मैं अपनी मेडिकल रिपोर्ट कैसे अपलोड करूँ?',
    },
    {
      id: 'demo-or',
      label: 'ଓଡ଼ିଆ: ଟ୍ରାଇଏଜ୍',
      query: 'ମୁଁ କିପରି ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରିବି?',
    },
    {
      id: 'demo-refusal',
      label: 'Medical Refusal Test',
      query: 'What medicine should I take for chest pain?',
    },
    {
      id: 'demo-emergency',
      label: 'Emergency Response Test',
      query: 'I have severe chest pain and difficulty breathing.',
    },
  ];

  const currentTourStep: TourStep = APP_TOUR_STEPS[currentTourStepIndex];

  return (
    <>
      {/* 1. FIRST-TIME ONBOARDING WELCOME BUBBLE */}
      {showWelcomeBubble && !isOpen && (
        <div
          role="region"
          aria-label="Srida Welcome Introduction"
          className="fixed bottom-24 right-6 z-40 max-w-[290px] sm:max-w-[320px] bg-white dark:bg-slate-800 border-2 border-teal-500/50 dark:border-teal-500/40 rounded-2xl shadow-2xl p-3.5 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Close button */}
          <button
            onClick={handleDismissBubble}
            aria-label="Dismiss welcome message"
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="pr-4">
              <h4 className="font-bold text-teal-700 dark:text-teal-300 text-[12.5px] leading-tight mb-1">
                Srida — Your Guide
              </h4>
              <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-snug">
                {ONBOARDING_WELCOME_BUBBLE[sridaLocale]}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <button
              onClick={handleStartTour}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Show Me Around</span>
            </button>

            <button
              onClick={handleBubbleClick}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Ask Srida →
            </button>
          </div>

          {/* Indicator tail pointing down toward floating button */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-teal-500/50 dark:border-teal-500/40 transform rotate-45" />
        </div>
      )}

      {/* 2. FLOATING "ASK SRIDA" BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
          {/* Tooltip */}
          <div
            id="srida-tooltip"
            role="tooltip"
            className="hidden group-hover:block group-focus-within:block bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap dark:bg-slate-800 border border-slate-700 pointer-events-none transition-opacity"
          >
            Need help using TriageBridge?
          </div>

          <button
            onClick={() => {
              setShowWelcomeBubble(false);
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Ask Srida — Your TriageBridge Guide. Need help using TriageBridge?"
            aria-describedby="srida-tooltip"
            aria-expanded={isOpen}
            className="flex items-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-500/40 text-sm font-semibold cursor-pointer border border-teal-500/30"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-100 animate-pulse" />
              <span
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                title={isOnline ? 'Online' : 'Offline FAQ Mode'}
              />
            </div>
            <span>Ask Srida</span>
          </button>
        </div>
      )}

      {/* 3. CHATBOT INTERFACE: SIDE PANEL (DESKTOP) / BOTTOM SHEET (MOBILE) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Srida — Your TriageBridge Guide Chat Panel"
          className={`fixed z-50 flex flex-col bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 ease-in-out ${
            isMinimized
              ? 'bottom-6 right-4 sm:right-6 w-72 sm:w-80 h-16 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden'
              : 'inset-x-0 bottom-0 h-[88vh] max-h-[92vh] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 sm:rounded-none sm:top-0 sm:right-0 sm:bottom-0 sm:left-auto sm:h-full sm:w-[420px] sm:max-h-full sm:border-l sm:border-t-0 overflow-hidden'
          }`}
        >
          {/* Mobile Bottom-Sheet Drag Handle */}
          {!isMinimized && (
            <div className="sm:hidden w-full flex items-center justify-center pt-2 pb-1 bg-gradient-to-r from-teal-800 to-teal-700">
              <div className="w-12 h-1 bg-teal-300/40 rounded-full" />
            </div>
          )}

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 text-white select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full bg-teal-500/40 border border-teal-300/40 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-teal-800 ${
                    isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-wide truncate">Srida</h3>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                      isOnline
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                    }`}
                  >
                    {isOnline ? (
                      <>
                        <Wifi className="w-2.5 h-2.5" />
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-2.5 h-2.5" />
                        Offline FAQ
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-teal-100 truncate">Your TriageBridge Guide</p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <>
                  <button
                    onClick={handleStartTour}
                    title="Guided Tour (Show Me Around)"
                    aria-label="Start Guided App Tour"
                    className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearChat}
                    title="Clear Chat History"
                    aria-label="Clear Chat History"
                    className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand Assistant' : 'Minimize Assistant'}
                aria-label={isMinimized ? 'Expand Assistant' : 'Minimize Assistant'}
                className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-500/30 rounded-lg transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Srida"
                aria-label="Close Srida"
                className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-500/30 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* LANGUAGE SELECTOR & SUB-TABS */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs">
                {/* Language Switcher */}
                <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                  <div className="inline-flex rounded-md shadow-sm">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-l cursor-pointer ${
                        sridaLocale === 'en'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange('hi')}
                      className={`px-2 py-0.5 text-[11px] font-medium cursor-pointer ${
                        sridaLocale === 'hi'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => handleLanguageChange('or')}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-r cursor-pointer ${
                        sridaLocale === 'or'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ଓଡ଼ିଆ
                    </button>
                  </div>
                </div>

                {/* Sub-navigation tabs: Chat | FAQs | Guided Nav */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab(activeTab === 'faqs' ? 'chat' : 'faqs')}
                    className={`flex items-center gap-1 text-[11px] font-medium cursor-pointer ${
                      activeTab === 'faqs'
                        ? 'text-teal-600 dark:text-teal-400 font-bold underline'
                        : 'text-slate-600 dark:text-slate-300 hover:text-teal-600'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>FAQs</span>
                  </button>

                  <button
                    onClick={() => setActiveTab(activeTab === 'navigation' ? 'chat' : 'navigation')}
                    className={`flex items-center gap-1 text-[11px] font-medium cursor-pointer ${
                      activeTab === 'navigation'
                        ? 'text-teal-600 dark:text-teal-400 font-bold underline'
                        : 'text-slate-600 dark:text-slate-300 hover:text-teal-600'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Go To</span>
                  </button>
                </div>
              </div>

              {/* PERMANENT SAFETY NOTICES & SYNTHETIC DEMO BANNER */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/40 px-3 py-1.5 text-[10.5px] text-amber-800 dark:text-amber-300 flex flex-col gap-0.5">
                <div className="flex items-center justify-between font-semibold">
                  <span>{SRIDA_DISCLAIMERS.SYNTHETIC_DEMO[sridaLocale]}</span>
                  <span className="text-[9.5px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                    Demo Mode
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400/90">
                  <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                  <span>{SRIDA_DISCLAIMERS.PERMANENT_NOTICE[sridaLocale]}</span>
                </div>
                {!isOnline && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-900 dark:text-amber-200 font-medium">
                    <WifiOff className="w-3 h-3 flex-shrink-0" />
                    <span>{SRIDA_DISCLAIMERS.OFFLINE_NOTICE[sridaLocale]}</span>
                  </div>
                )}
              </div>

              {/* CONTEXT-AWARE ROUTE GUIDANCE CARD */}
              {routeGuidance && activeTab === 'chat' && (
                <div className="mx-3 mt-2 p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-teal-900 dark:text-teal-200 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      {routeGuidance.title}
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium bg-teal-100/60 dark:bg-teal-900/40 px-1.5 py-0.5 rounded">
                      Current Page
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                    {routeGuidance.description}
                  </p>
                  {routeGuidance.actionLabel && routeGuidance.actionRoute && (
                    <button
                      onClick={() => router.push(routeGuidance.actionRoute!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 rounded-md hover:bg-teal-200 cursor-pointer"
                    >
                      {routeGuidance.actionLabel}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* VIEW 1: GUIDED NAVIGATION */}
              {activeTab === 'navigation' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                        Guided Navigation
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Select a section to navigate without leaving your place:
                      </p>
                    </div>
                    <button
                      onClick={handleStartTour}
                      className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 hover:bg-teal-100 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>App Tour</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {GUIDED_NAVIGATION_ACTIONS.map((item) => {
                      const label =
                        sridaLocale === 'hi'
                          ? item.labelHi
                          : sridaLocale === 'or'
                          ? item.labelOr
                          : item.labelEn;
                      const isCurrent = pathname === item.route;

                      return (
                        <button
                          key={item.id}
                          onClick={() => router.push(item.route)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400 hover:bg-slate-100'
                          }`}
                        >
                          <span>{label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={handleResetOnboarding}
                      className="text-[11px] text-slate-500 hover:text-teal-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Welcome Bubble</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="text-[11px] font-semibold text-teal-600 hover:underline cursor-pointer"
                    >
                      Return to Chat →
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: FAQ BROWSER (ALL 27 ENTRIES) */}
              {activeTab === 'faqs' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Verified Knowledge Base
                    </h4>
                    <span className="text-[11px] text-slate-500">27 Verified Answers</span>
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {FAQ_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setActiveFaqCategory(cat.key);
                          setExpandedFaqId(null);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                          activeFaqCategory === cat.key
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {sridaLocale === 'hi' ? cat.hi : sridaLocale === 'or' ? cat.or : cat.en}
                      </button>
                    ))}
                  </div>

                  {/* FAQ List */}
                  <div className="space-y-2">
                    {getFaqsByCategory(activeFaqCategory).map((entry) => {
                      const isExpanded = expandedFaqId === entry.id;
                      const qText =
                        sridaLocale === 'hi'
                          ? entry.questionHi
                          : sridaLocale === 'or'
                          ? entry.questionOr
                          : entry.questionEn;
                      const aText =
                        sridaLocale === 'hi'
                          ? entry.verifiedAnswerHi
                          : sridaLocale === 'or'
                          ? entry.verifiedAnswerOr
                          : entry.verifiedAnswerEn;
                      const btnLabel =
                        sridaLocale === 'hi'
                          ? entry.actionButtonLabelHi
                          : sridaLocale === 'or'
                          ? entry.actionButtonLabelOr
                          : entry.actionButtonLabelEn;

                      return (
                        <div
                          key={entry.id}
                          className="border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                        >
                          <button
                            onClick={() => setExpandedFaqId(isExpanded ? null : entry.id)}
                            className="w-full text-left font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span>{qText}</span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                              <p className="mb-2.5">{aText}</p>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                {entry.relatedRoute && btnLabel && (
                                  <button
                                    onClick={() => router.push(entry.relatedRoute!)}
                                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{btnLabel}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSelectFaq(entry)}
                                  className="text-teal-600 dark:text-teal-400 text-[11px] font-medium hover:underline cursor-pointer"
                                >
                                  Ask in chat →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: CHAT STREAM */}
              {activeTab === 'chat' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* QUICK SYNTHETIC DEMO PILLS */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                      <span>Quick Test Scenarios:</span>
                      <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold">
                        Click to ask
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {syntheticDemoPills.map((pill) => (
                        <button
                          key={pill.id}
                          onClick={() => handleSendMessage(pill.query)}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-500 hover:text-teal-600 text-[10.5px] cursor-pointer transition-colors"
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MESSAGES */}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-teal-600 text-white rounded-br-none'
                            : msg.isEmergency
                            ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-100 rounded-bl-none'
                            : msg.isMedicalRefusal
                            ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-100 rounded-bl-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {/* Emergency banner badge */}
                        {msg.isEmergency && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>EMERGENCY SAFETY PROTOCOL</span>
                          </div>
                        )}

                        {/* Medical refusal badge */}
                        {msg.isMedicalRefusal && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>MEDICAL BOUNDARY NOTICE</span>
                          </div>
                        )}

                        <p className="whitespace-pre-line leading-relaxed text-[12px]">{msg.text}</p>

                        {/* Primary Navigation Action Button */}
                        {msg.relatedRoute && msg.actionButtonLabel && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <button
                              onClick={() => router.push(msg.relatedRoute!)}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                            >
                              <span>{msg.actionButtonLabel}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Secondary Action Buttons */}
                        {msg.secondaryActions && msg.secondaryActions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.secondaryActions.map((sec, idx) => {
                              if (sec.href) {
                                return (
                                  <a
                                    key={idx}
                                    href={sec.href}
                                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md shadow-sm transition-colors ${
                                      sec.variant === 'emergency'
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300'
                                    }`}
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{sec.label}</span>
                                  </a>
                                );
                              }
                              return (
                                <button
                                  key={idx}
                                  onClick={() => sec.route && router.push(sec.route)}
                                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md shadow-sm transition-colors cursor-pointer ${
                                    sec.variant === 'primary'
                                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300'
                                  }`}
                                >
                                  <span>{sec.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Assistant Message Metadata & Feedback Bar */}
                      {msg.sender === 'srida' && (
                        <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                          <span>{msg.timestamp}</span>

                          {msg.source === 'VERIFIED_KB' && (
                            <span className="text-teal-600 dark:text-teal-400 font-medium">
                              • Verified KB
                            </span>
                          )}

                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleFeedback(msg.id, 'helpful')}
                              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                                msg.feedback === 'helpful'
                                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title="Helpful"
                              aria-label="Mark response as helpful"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, 'not_helpful')}
                              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                                msg.feedback === 'not_helpful'
                                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title="Not Helpful"
                              aria-label="Mark response as not helpful"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Suggestions on "Not Helpful" */}
                      {msg.feedback === 'not_helpful' && msg.suggestedFaqs && (
                        <div className="mt-2 w-[90%] p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                            Would these help instead?
                          </p>
                          <div className="space-y-1">
                            {msg.suggestedFaqs.map((faq) => (
                              <button
                                key={faq.id}
                                onClick={() => handleSendMessage(faq.question)}
                                className="w-full text-left text-[11px] text-teal-600 dark:text-teal-400 hover:underline cursor-pointer truncate"
                              >
                                • {faq.question}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                            <button
                              onClick={() => router.push('/patient/cases')}
                              className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600"
                            >
                              Contact Case Support →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2">
                      <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span>Srida is finding verified guidance...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* INPUT FORM (SHOWN IN CHAT TAB) */}
              {activeTab === 'chat' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      sridaLocale === 'hi'
                        ? 'TriageBridge के बारे में स्रीदा से पूछें...'
                        : sridaLocale === 'or'
                        ? 'TriageBridge ବିଷୟରେ ସ୍ରିଦାଙ୍କୁ ପଚାରନ୍ତୁ...'
                        : 'Ask Srida about TriageBridge...'
                    }
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isProcessing}
                    aria-label="Send question to Srida"
                    className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* MANDATORY APPLICATION-WIDE DISCLAIMER FOOTER */}
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-950 text-[9.5px] text-slate-500 dark:text-slate-400 text-center leading-tight border-t border-slate-200 dark:border-slate-800">
                {SRIDA_DISCLAIMERS.APP_WIDE_DISCLAIMER[sridaLocale]}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. GUIDED APP TOUR MODAL OVERLAY (9 STEPS) */}
      {isTourActive && (
        <div
          role="dialog"
          aria-label="TriageBridge Guided Interface Tour"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-teal-500/40 p-5 text-slate-800 dark:text-slate-100">
            {/* Tour step counter and skip */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>
                  Step {currentTourStep.step} of {APP_TOUR_STEPS.length}
                </span>
              </span>

              <button
                onClick={handleFinishTour}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
              >
                Skip Tour
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
              <div
                className="bg-teal-600 h-full transition-all duration-300"
                style={{
                  width: `${((currentTourStep.step) / APP_TOUR_STEPS.length) * 100}%`,
                }}
              />
            </div>

            {/* Step Content */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {sridaLocale === 'hi'
                ? currentTourStep.titleHi
                : sridaLocale === 'or'
                ? currentTourStep.titleOr
                : currentTourStep.titleEn}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {sridaLocale === 'hi'
                ? currentTourStep.contentHi
                : sridaLocale === 'or'
                ? currentTourStep.contentOr
                : currentTourStep.contentEn}
            </p>

            {/* Optional action to view section directly during tour */}
            {currentTourStep.targetRoute && (
              <div className="mb-4">
                <button
                  onClick={() => router.push(currentTourStep.targetRoute!)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 cursor-pointer"
                >
                  <span>
                    {sridaLocale === 'hi'
                      ? currentTourStep.actionLabelHi || 'अनुभाग पर जाएं'
                      : sridaLocale === 'or'
                      ? currentTourStep.actionLabelOr || 'ଏହି ବିଭାଗକୁ ଯାଆନ୍ତୁ'
                      : currentTourStep.actionLabelEn || 'Go to this section'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tour Navigation Controls (Back, Next, Finish) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handlePrevTourStep}
                disabled={currentTourStepIndex === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                {currentTourStepIndex === APP_TOUR_STEPS.length - 1 ? (
                  <button
                    onClick={handleFinishTour}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextTourStep}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
