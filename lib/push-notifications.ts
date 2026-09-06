// Web Push Notifications helper for ESB Hub
export async function getNotificationPermissionState(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return false
    }

    const registration = await navigator.serviceWorker.ready
    if (!registration) {
      return false
    }

    const options: any = {
      body: 'Vous recevrez désormais les alertes de cours, examens et annonces en temps réel.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
    }

    registration.showNotification('ESB Hub — Notifications activées', options)

    return true
  } catch (err) {
    console.warn('Could not register push notifications:', err)
    return false
  }
}
