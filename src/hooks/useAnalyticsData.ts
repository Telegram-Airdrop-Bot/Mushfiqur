import { useEffect, useCallback } from 'react';

interface UserSession {
  id: string;
  deviceInfo: {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
  locationInfo: {
    country: string;
    city: string;
    ip: string;
  };
  visitInfo: {
    entryPage: string;
    currentPage: string;
    visitCount: number;
    firstVisit: Date;
    lastVisit: Date;
    sessionDuration: number;
  };
  chatHistory: Array<{
    message: string;
    isFromUser: boolean;
    timestamp: Date;
  }>;
  isActive: boolean;
  lastActivity: Date;
}

export const useAnalyticsData = () => {
  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get device information
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const screen = window.screen;
    
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    
    // More accurate device detection
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
      if (/ipad|tablet|playbook|silk/i.test(userAgent) || 
          (screen.width >= 768 && screen.height >= 1024) ||
          (screen.width >= 1024 && screen.height >= 768)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'mobile';
      }
    }

    let browser = 'Unknown';
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) browser = 'Chrome';
    else if (userAgent.includes('firefox')) browser = 'Firefox';
    else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'Safari';
    else if (userAgent.includes('edg')) browser = 'Edge';
    else if (userAgent.includes('opera') || userAgent.includes('opr')) browser = 'Opera';
    else if (userAgent.includes('brave')) browser = 'Brave';

    let os = 'Unknown';
    if (userAgent.includes('windows')) os = 'Windows';
    else if (userAgent.includes('mac')) os = 'macOS';
    else if (userAgent.includes('linux') && !userAgent.includes('android')) os = 'Linux';
    else if (userAgent.includes('android')) os = 'Android';
    else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'iOS';
    else if (userAgent.includes('ubuntu')) os = 'Ubuntu';
    else if (userAgent.includes('fedora')) os = 'Fedora';

    return { deviceType, browser, os };
  }, []);

  // Get location information (improved)
  const getLocationInfo = useCallback(async () => {
    try {
      // Try multiple IP geolocation services for better accuracy
      let locationData = null;
      
      // First try ipapi.co
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://ipapi.co/json/', { 
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          locationData = await response.json();
        }
      } catch (e) {
        console.log('ipapi.co failed, trying alternative...');
      }
      
      // Fallback to ip-api.com if first fails
      if (!locationData) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch('http://ip-api.com/json/', { 
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            locationData = {
              country_name: data.country,
              city: data.city,
              ip: data.query
            };
          }
        } catch (e) {
          console.log('ip-api.com also failed');
        }
      }
      
      if (locationData) {
        return {
          country: locationData.country_name || locationData.country || 'Unknown',
          city: locationData.city || 'Unknown',
          ip: locationData.ip || 'Unknown'
        };
      }
      
      // Final fallback - try to detect from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let detectedCountry = 'Unknown';
      let detectedCity = 'Unknown';
      
      if (timezone) {
        if (timezone.includes('Asia/Dhaka')) {
          detectedCountry = 'Bangladesh';
          detectedCity = 'Dhaka';
        } else if (timezone.includes('America/New_York')) {
          detectedCountry = 'United States';
          detectedCity = 'New York';
        } else if (timezone.includes('Europe/London')) {
          detectedCountry = 'United Kingdom';
          detectedCity = 'London';
        } else if (timezone.includes('Asia/Kolkata')) {
          detectedCountry = 'India';
          detectedCity = 'Mumbai';
        } else if (timezone.includes('Australia/Sydney')) {
          detectedCountry = 'Australia';
          detectedCity = 'Sydney';
        }
      }
      
      return {
        country: detectedCountry,
        city: detectedCity,
        ip: 'Detected from timezone'
      };
      
    } catch (error) {
      console.log('Location detection failed, using timezone fallback');
      // Use timezone as final fallback
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return {
        country: timezone ? timezone.split('/')[0] : 'Unknown',
        city: timezone ? timezone.split('/')[1] : 'Unknown',
        ip: 'Timezone fallback'
      };
    }
  }, []);

  // Get visit information
  const getVisitInfo = useCallback((entryPage: string) => {
    const referrer = document.referrer || 'Direct';
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
    const firstVisit = localStorage.getItem('firstVisit') || Date.now().toString();
    
    localStorage.setItem('visitCount', visitCount.toString());
    if (!localStorage.getItem('firstVisit')) {
      localStorage.setItem('firstVisit', firstVisit);
    }

    return {
      entryPage,
      currentPage: entryPage,
      visitCount,
      firstVisit: new Date(parseInt(firstVisit)),
      lastVisit: new Date(),
      sessionDuration: 0
    };
  }, []);

  // Initialize or update session
  const initializeSession = useCallback(async () => {
    try {
      const sessionId = generateSessionId();
      const deviceInfo = getDeviceInfo();
      const locationInfo = await getLocationInfo();
      const entryPage = window.location.pathname;
      const visitInfo = getVisitInfo(entryPage);

      const newSession: UserSession = {
        id: sessionId,
        deviceInfo,
        locationInfo,
        visitInfo,
        chatHistory: [],
        isActive: true,
        lastActivity: new Date()
      };

      // Save current session
      localStorage.setItem('currentSession', JSON.stringify(newSession));

      // Add to sessions history
      const existingSessions = localStorage.getItem('userSessions');
      let allSessions: UserSession[] = [];
      
      if (existingSessions) {
        try {
          allSessions = JSON.parse(existingSessions);
        } catch (e) {
          console.log('Error parsing existing sessions');
        }
      }

      // Keep only last 100 sessions to prevent localStorage from getting too large
      allSessions = [newSession, ...allSessions].slice(0, 100);
      localStorage.setItem('userSessions', JSON.stringify(allSessions));

      console.log('Session initialized:', newSession);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [generateSessionId, getDeviceInfo, getLocationInfo, getVisitInfo]);

  // Update session activity
  const updateSessionActivity = useCallback(() => {
    try {
      const currentSession = localStorage.getItem('currentSession');
      if (currentSession) {
        const session = JSON.parse(currentSession);
        session.lastActivity = new Date();
        session.visitInfo.currentPage = window.location.pathname;
        session.visitInfo.sessionDuration = Math.floor((Date.now() - session.visitInfo.firstVisit.getTime()) / 1000);
        
        localStorage.setItem('currentSession', JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }, []);

  // Add chat message to session
  const addChatMessage = useCallback((message: string, isFromUser: boolean) => {
    try {
      const currentSession = localStorage.getItem('currentSession');
      if (currentSession) {
        const session = JSON.parse(currentSession);
        session.chatHistory.push({
          message,
          isFromUser,
          timestamp: new Date()
        });
        session.lastActivity = new Date();
        
        localStorage.setItem('currentSession', JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error adding chat message:', error);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((url: string) => {
    try {
      const currentSession = localStorage.getItem('currentSession');
      if (currentSession) {
        const session = JSON.parse(currentSession);
        session.visitInfo.currentPage = url;
        session.lastActivity = new Date();
        
        localStorage.setItem('currentSession', JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();

    // Set up activity tracking
    const activityInterval = setInterval(updateSessionActivity, 30000); // Every 30 seconds

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateSessionActivity();
      }
    };

    // Track before unload
    const handleBeforeUnload = () => {
      try {
        const currentSession = localStorage.getItem('currentSession');
        if (currentSession) {
          const session = JSON.parse(currentSession);
          session.isActive = false;
          session.lastActivity = new Date();
          session.visitInfo.sessionDuration = Math.floor((Date.now() - session.visitInfo.firstVisit.getTime()) / 1000);
          
          localStorage.setItem('currentSession', JSON.stringify(session));
        }
      } catch (error) {
        console.error('Error saving session on unload:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(activityInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initializeSession, updateSessionActivity]);

  return {
    addChatMessage,
    trackPageView,
    updateSessionActivity
  };
}; 