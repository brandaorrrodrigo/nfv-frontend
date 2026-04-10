const STORAGE_KEY = 'nfv_last_analysis';

export const notificationsManager = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    return Notification.requestPermission();
  },

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;
    try {
      return await navigator.serviceWorker.register('/sw.js');
    } catch {
      console.warn('SW registration failed');
      return null;
    }
  },

  async scheduleLocal(title: string, body: string, tag?: string): Promise<void> {
    if (this.getPermission() !== 'granted') return;
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: tag ?? 'nfv-pose',
        // @ts-expect-error vibrate is valid for ServiceWorkerRegistration.showNotification
        vibrate: [200, 100, 200],
      });
    } else {
      new Notification(title, { body, tag: tag ?? 'nfv-pose' });
    }
  },

  saveLastAnalysisDate(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  },

  getDaysSinceLastAnalysis(): number | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const diff = Date.now() - new Date(stored).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },

  async checkAndRemind(): Promise<void> {
    const days = this.getDaysSinceLastAnalysis();
    if (days === null || days < 7) return;
    await this.scheduleLocal(
      'Hora de treinar suas poses!',
      `Faz ${days} dias desde sua ultima analise. Que tal praticar hoje?`,
      'nfv-reminder',
    );
  },
};
