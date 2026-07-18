'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate or retrieve session ID (per tab session)
    let sessionId = sessionStorage.getItem('corenews_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      sessionStorage.setItem('corenews_session_id', sessionId);
    }

    // Check if new unique visitor today
    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    const lastVisitDate = localStorage.getItem('corenews_last_visit_date');
    const isNewVisitor = lastVisitDate !== todayStr;

    // Send tracking request
    const track = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId,
            is_new_visitor: isNewVisitor,
            page: pathname
          })
        });

        // If it succeeded and was a new visitor, save today's date
        if (isNewVisitor) {
          localStorage.setItem('corenews_last_visit_date', todayStr);
        }
      } catch (err) {
        console.error('Failed to log visit event:', err);
      }
    };

    track();

    // Heartbeat to keep session active every 2 minutes (120000ms)
    const interval = setInterval(() => {
      // Only send heartbeat if page is currently visible to conserve resources
      if (document.visibilityState === 'visible') {
        fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId,
            is_new_visitor: false, // heartbeats do not count as new visits
            page: pathname
          })
        }).catch(err => console.error('Failed to send session heartbeat:', err));
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
