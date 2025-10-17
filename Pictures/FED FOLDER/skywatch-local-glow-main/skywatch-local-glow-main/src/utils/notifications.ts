export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

export function notifyUser(title: string, body?: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      // Fallback: change document title briefly
      const old = document.title;
      document.title = `🔔 ${title}`;
      setTimeout(() => (document.title = old), 4000);
    }
  } catch (e) {
    console.warn('Notification failed', e);
  }
}
