import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  LogOut, 
  Home, 
  Bell, 
  Settings, 
  User,
  Calendar,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationCenter } from './NotificationCenter';
import { useContentSections } from '@/hooks/useContentSections';

interface AdminHeaderProps {
  user: any;
  onSignOut: () => void;
}

export function AdminHeader({ user, onSignOut }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { activeSections } = useContentSections();
  
  // Get settings section from active sections
  const settingsSection = activeSections.find(section => section.section_type === 'settings');
  const settings = settingsSection?.metadata || {};
  const logoUrl = settings.logoUrl || '';
  
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo"
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ width: '40px', height: '40px' }}
                  onError={(e) => {
                    // Fallback to Shield icon if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling;
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'block';
                    }
                  }}
                />
              ) : null}
              {!logoUrl && (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-muted-foreground">
                  {getGreeting()}, {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Center Section - Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{currentTime.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>

            {/* Right Section - User Info and Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => setIsNotificationOpen(true)}
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="hidden sm:flex"
                >
                  <Home className="h-4 w-4 mr-2" />
                  View Site
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin?tab=settings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSignOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </>
  );
} 