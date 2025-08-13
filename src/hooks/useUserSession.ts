import { useState, useEffect, useCallback, useRef } from 'react';
import { UserSession, DeviceInfo, LocationInfo, VisitInfo, PageView, ChatMessage } from '@/types/user-session';

export const useUserSession = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pageStartTime, setPageStartTime] = useState<Date>(new Date());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get device information
  const getDeviceInfo = useCallback((): DeviceInfo => {
    const userAgent = navigator.userAgent;
    const screen = window.screen;
    
    // Detect browser
    let browser = 'Unknown';
    let browserVersion = 'Unknown';
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    // Detect OS
    let os = 'Unknown';
    let osVersion = 'Unknown';
    if (userAgent.includes('Windows')) {
      os = 'Windows';
      osVersion = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
      osVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
      osVersion = 'Unknown';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
      osVersion = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
      osVersion = userAgent.match(/OS (\d+[._]\d+)/)?.[1] || 'Unknown';
    }

    // Detect device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (userAgent.includes('Mobile')) {
      deviceType = 'mobile';
    } else if (userAgent.includes('Tablet') || screen.width >= 768 && screen.height >= 1024) {
      deviceType = 'tablet';
    }

    return {
      userAgent,
      browser,
      browserVersion,
      os,
      osVersion,
      device: `${os} ${osVersion}`,
      deviceType,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isOnline: navigator.onLine
    };
  }, []);

  // Get location information (using IP geolocation)
  const getLocationInfo = useCallback(async (): Promise<LocationInfo> => {
    try {
      // Try to get location from IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        ip: data.ip || 'Unknown',
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'Unknown',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        latitude: data.latitude,
        longitude: data.longitude,
        isp: data.org || 'Unknown',
        timezone: data.timezone || 'Unknown',
        currency: data.currency || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching location info:', error);
      return {
        ip: 'Unknown',
        country: 'Unknown',
        countryCode: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        isp: 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: 'Unknown'
      };
    }
  }, []);

  // Get visit information
  const getVisitInfo = useCallback((entryPage: string): VisitInfo => {
    const referrer = document.referrer || 'Direct';
    const searchQuery = new URLSearchParams(window.location.search).get('q') || undefined;
    
    return {
      entryPage,
      currentPage: entryPage,
      visitCount: parseInt(localStorage.getItem('visitCount') || '0') + 1,
      firstVisit: new Date(localStorage.getItem('firstVisit') || Date.now()),
      lastVisit: new Date(),
      sessionDuration: 0,
      pageViews: [{
        url: entryPage,
        title: document.title,
        timestamp: new Date(),
        duration: 0
      }],
      referrer,
      searchQuery
    };
  }, []);

  // Initialize session
  const initializeSession = useCallback(async () => {
    try {
      const sessionId = generateSessionId();
      const deviceInfo = getDeviceInfo();
      const locationInfo = await getLocationInfo();
      const entryPage = window.location.pathname;
      const visitInfo = getVisitInfo(entryPage);

      // Update visit count in localStorage
      const currentCount = parseInt(localStorage.getItem('visitCount') || '0');
      localStorage.setItem('visitCount', (currentCount + 1).toString());
      if (!localStorage.getItem('firstVisit')) {
        localStorage.setItem('firstVisit', Date.now().toString());
      }

      const newSession: UserSession = {
        id: sessionId,
        sessionId,
        deviceInfo,
        locationInfo,
        visitInfo,
        chatHistory: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        referrer: visitInfo.referrer,
        utmSource: new URLSearchParams(window.location.search).get('utm_source') || undefined,
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined
      };

      setSession(newSession);
      setIsTracking(true);

      // Save session to localStorage
      localStorage.setItem('currentSession', JSON.stringify(newSession));

      // Start session tracking
      startSessionTracking(newSession);

      // Send session data to server
      await saveSessionToServer(newSession);

      console.log('Session initialized:', newSession);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [generateSessionId, getDeviceInfo, getLocationInfo, getVisitInfo]);

  // Start session tracking
  const startSessionTracking = useCallback((sessionData: UserSession) => {
    // Update session every 30 seconds
    sessionIntervalRef.current = setInterval(() => {
      updateSessionActivity();
    }, 30000);

    // Track page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Track beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Update session activity
  const updateSessionActivity = useCallback(() => {
    if (session) {
      const updatedSession = {
        ...session,
        lastActivity: new Date(),
        visitInfo: {
          ...session.visitInfo,
          currentPage: window.location.pathname,
          sessionDuration: Math.floor((Date.now() - session.createdAt.getTime()) / 1000)
        }
      };

      setSession(updatedSession);
      localStorage.setItem('currentSession', JSON.stringify(updatedSession));
    }
  }, [session]);

  // Handle page visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden, pause tracking
      setIsTracking(false);
    } else {
      // Page is visible, resume tracking
      setIsTracking(true);
      updateSessionActivity();
    }
  }, [updateSessionActivity]);

  // Handle online status
  const handleOnline = useCallback(() => {
    if (session) {
      const updatedSession = {
        ...session,
        deviceInfo: {
          ...session.deviceInfo,
          isOnline: true
        }
      };
      setSession(updatedSession);
    }
  }, [session]);

  // Handle offline status
  const handleOffline = useCallback(() => {
    if (session) {
      const updatedSession = {
        ...session,
        deviceInfo: {
          ...session.deviceInfo,
          isOnline: false
        }
      };
      setSession(updatedSession);
    }
  }, [session]);

  // Handle before unload
  const handleBeforeUnload = useCallback(() => {
    if (session) {
      // Save final session data
      const finalSession = {
        ...session,
        lastActivity: new Date(),
        isActive: false,
        visitInfo: {
          ...session.visitInfo,
          sessionDuration: Math.floor((Date.now() - session.createdAt.getTime()) / 1000)
        }
      };

      localStorage.setItem('currentSession', JSON.stringify(finalSession));
      saveSessionToServer(finalSession);
    }
  }, [session]);

  // Track page view
  const trackPageView = useCallback((url: string, title: string) => {
    if (session) {
      const pageView: PageView = {
        url,
        title,
        timestamp: new Date(),
        duration: Math.floor((Date.now() - pageStartTime.getTime()) / 1000)
      };

      const updatedSession = {
        ...session,
        visitInfo: {
          ...session.visitInfo,
          currentPage: url,
          pageViews: [...session.visitInfo.pageViews, pageView]
        }
      };

      setSession(updatedSession);
      localStorage.setItem('currentSession', JSON.stringify(updatedSession));
      setPageStartTime(new Date());
    }
  }, [session, pageStartTime]);

  // Track typing activity
  const trackTyping = useCallback((isUserTyping: boolean) => {
    setIsTyping(isUserTyping);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isUserTyping) {
      // User is typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000); // Reset after 3 seconds of no typing
    }
  }, []);

  // Add chat message to session
  const addChatMessage = useCallback((message: string, isFromUser: boolean, messageType: 'text' | 'image' | 'file' = 'text') => {
    if (session) {
      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: session.sessionId,
        message,
        isFromUser,
        timestamp: new Date(),
        messageType
      };

      const updatedSession = {
        ...session,
        chatHistory: [...session.chatHistory, chatMessage],
        lastActivity: new Date()
      };

      setSession(updatedSession);
      localStorage.setItem('currentSession', JSON.stringify(updatedSession));
    }
  }, [session]);

  // Save session to server
  const saveSessionToServer = useCallback(async (sessionData: UserSession) => {
    try {
      // Here you would send the session data to your backend
      // For now, we'll just log it
      console.log('Saving session to server:', sessionData);
      
      // Example API call:
      // await fetch('/api/sessions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sessionData)
      // });
    } catch (error) {
      console.error('Error saving session to server:', error);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleVisibilityChange, handleOnline, handleOffline, handleBeforeUnload]);

  // Initialize session on mount
  useEffect(() => {
    // Check if session exists in localStorage
    const existingSession = localStorage.getItem('currentSession');
    if (existingSession) {
      try {
        const parsedSession = JSON.parse(existingSession);
        setSession(parsedSession);
        setIsTracking(true);
        startSessionTracking(parsedSession);
      } catch (error) {
        console.error('Error parsing existing session:', error);
        initializeSession();
      }
    } else {
      initializeSession();
    }

    return cleanup;
  }, [initializeSession, startSessionTracking, cleanup]);

  // Track page changes
  useEffect(() => {
    if (currentPage && currentPage !== window.location.pathname) {
      trackPageView(currentPage, document.title);
    }
    setCurrentPage(window.location.pathname);
  }, [currentPage, trackPageView]);

  return {
    session,
    isTracking,
    isTyping,
    trackPageView,
    trackTyping,
    addChatMessage,
    updateSessionActivity,
    cleanup
  };
}; 