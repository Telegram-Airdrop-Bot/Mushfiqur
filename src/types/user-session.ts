export interface UserSession {
  id: string;
  sessionId: string;
  userId?: string; // If user is logged in
  deviceInfo: DeviceInfo;
  locationInfo: LocationInfo;
  visitInfo: VisitInfo;
  chatHistory: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;
  language: string;
  timezone: string;
  isOnline: boolean;
}

export interface LocationInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isp: string;
  timezone: string;
  currency: string;
}

export interface VisitInfo {
  entryPage: string;
  currentPage: string;
  visitCount: number;
  firstVisit: Date;
  lastVisit: Date;
  sessionDuration: number; // in seconds
  pageViews: PageView[];
  referrer: string;
  searchQuery?: string;
}

export interface PageView {
  url: string;
  title: string;
  timestamp: Date;
  duration: number; // time spent on page
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  isFromUser: boolean;
  timestamp: Date;
  messageType: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  weeklyVisits: number;
  monthlyVisits: number;
  topCountries: CountryVisit[];
  topCities: CityVisit[];
  deviceStats: DeviceStats;
  pageStats: PageStats;
  referrerStats: ReferrerStats;
  timeStats: TimeStats;
}

export interface CountryVisit {
  country: string;
  countryCode: string;
  visits: number;
  percentage: number;
}

export interface CityVisit {
  city: string;
  region: string;
  country: string;
  visits: number;
  percentage: number;
}

export interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
  total: number;
}

export interface PageStats {
  page: string;
  visits: number;
  uniqueVisitors: number;
  averageTime: number;
  bounceRate: number;
}

export interface ReferrerStats {
  source: string;
  visits: number;
  percentage: number;
}

export interface TimeStats {
  hour: number;
  visits: number;
  percentage: number;
}

export interface SessionFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  country?: string;
  city?: string;
  deviceType?: string;
  isActive?: boolean;
  hasChat?: boolean;
}

export interface RealTimeVisitor {
  sessionId: string;
  currentPage: string;
  timeOnPage: number;
  isTyping: boolean;
  lastActivity: Date;
  deviceInfo: DeviceInfo;
  locationInfo: LocationInfo;
} 