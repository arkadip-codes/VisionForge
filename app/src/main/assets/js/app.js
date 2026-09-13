// Main App Controller & State Manager for VISIONFORGE MINE AR

import { Router } from './router.js';
import { initSyncEngine } from './sync.js';
import { getLocalWorker, saveLocalWorker } from './db.js';
import { setLanguage, getLanguage } from './i18n.js';

const appState = {
  userRole: localStorage.getItem('mine_ar_role') || 'trainee', // 'trainee' or 'supervisor'
  worker: {
    id: "suresh_01",
    name: "Suresh",
    role: "Underground Belt Conveyor Operator",
    mine_location: "Dhanbad Seam #4 (BCCL)",
    level: 1,
    level_title: "Mining Trainee",
    xp: 120,
    progress_pct: 28,
    competency_score: 78.5,
    avatar_url: "/assets/images/worker_avatar.svg",
    streaks: 4,
    notifications_count: 2
  },
  supervisor: {
    id: "supervisor_admin",
    name: "Er. R. K. Verma",
    designation: "Director of Mine Safety (DGMS Dhanbad)",
    role: "supervisor"
  },
  lastAttemptResult: null
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[MINE AR] Bootstrapping vocational simulator with complete activity history...');

  // 1. Try loading worker profile from API or IndexedDB
  const currentTraineeId = localStorage.getItem('mine_ar_user_id') || 'suresh_01';
  try {
    const apiResp = await fetch(`/api/v1/trainees/${currentTraineeId}`);
    if (apiResp.ok) {
      const apiWorker = await apiResp.json();
      appState.worker = apiWorker;
      await saveLocalWorker(apiWorker);
    } else {
      const localWorker = await getLocalWorker(currentTraineeId);
      if (localWorker) appState.worker = localWorker;
    }
  } catch (err) {
    const localWorker = await getLocalWorker(currentTraineeId);
    if (localWorker) appState.worker = localWorker;
  }

  // 2. Register Service Worker for offline operation
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('[ServiceWorker] Successfully registered');
    } catch (e) {
      console.warn('[ServiceWorker] Registration skipped:', e);
    }
  }

  // 3. Initialize Offline Sync Manager
  initSyncEngine();

  // 4. Initialize Client-Side Router
  const container = document.getElementById('main-view');
  const router = new Router(container, appState);
  router.init();

  // 5. Global Utility Bar Controls
  document.getElementById('btn-util-demo')?.addEventListener('click', () => {
    window.location.hash = '#demo';
  });

  // Switch Role / Login
  document.getElementById('btn-util-role')?.addEventListener('click', () => {
    window.location.hash = '#login';
  });

  // Language Quick Switcher
  document.getElementById('btn-util-lang')?.addEventListener('click', () => {
    const current = getLanguage();
    const next = current === 'en' ? 'hi' : (current === 'hi' ? 'sat' : 'en');
    setLanguage(next);
    document.getElementById('btn-util-lang').textContent = `🌐 ${next.toUpperCase()}`;
    router.handleRoute();
  });

  // Sync Pill click triggers immediate sync
  document.getElementById('sync-status-pill')?.addEventListener('click', async () => {
    const { syncPendingData } = await import('./sync.js');
    await syncPendingData();
  });

  // Listen to external worker update events
  document.addEventListener('workerUpdated', (e) => {
    appState.worker = e.detail;
    router.handleRoute();
  });

  document.addEventListener('languageChanged', () => {
    router.handleRoute();
  });

  console.log('[MINE AR] Initialized successfully. Current role:', appState.userRole);
});
