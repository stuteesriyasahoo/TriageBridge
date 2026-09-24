# TriageBridge

TriageBridge is a multilingual, human-in-the-loop healthcare triage web application that helps patients share symptoms and medical reports, preparing structured clinical case summaries for review by qualified healthcare professionals.

## Key Features

- **Multilingual Support**: Real-time translation supporting English, Hindi, and Odia, with clinical accuracy.
- **AI-Assisted Clinical Triage**: 10-step assessment workflow with rule-based emergency detection and urgency level scoring.
- **Patient Health Document Vault**: Categorized document management (10 categories), OCR data extraction simulator, and secure role-based sharing.
- **Appointments & Teleconsultation**: Online booking, token generation, and clinic scheduling.
- **Offline PWA Capabilities**: Service worker caching and IndexedDB offline submissions with automatic background sync.
- **Doctor Translation & Review View**: Structured clinical summary, differential considerations, and human-in-the-loop validation.

## Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: Next.js 14 / React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database / Backend**: Supabase
- **Offline / PWA**: Service Workers & IndexedDB

