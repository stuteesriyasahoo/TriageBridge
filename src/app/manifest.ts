import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TriageBridge - AI Clinical Triage Support',
    short_name: 'TriageBridge',
    description: 'Multimodal AI-assisted clinical triage urgency support and emergency care coordination.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#F7FAFC',
    theme_color: '#0F8B8D',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Start Triage',
        short_name: 'Triage',
        description: 'Start a guided 10-step clinical triage assessment',
        url: '/patient/triage',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Clinician Review Queue',
        short_name: 'Review Queue',
        description: 'View prioritized clinical review queue',
        url: '/healthcare/queue',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
