import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  FileText,
  Users,
  Star,
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: string;
  data?: any;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Generate sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Order Completed',
        message: 'Order #12345 has been completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        action: 'view-order',
        data: { orderId: '12345' }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Payment Pending',
        message: '3 orders are waiting for payment confirmation',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: false,
        action: 'view-pending-payments'
      },
      {
        id: '3',
        type: 'info',
        title: 'New User Registration',
        message: 'John Doe has registered a new account',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        action: 'view-user'
      },
      {
        id: '4',
        type: 'success',
        title: 'Project Added',
        message: 'New portfolio project "E-commerce Bot" has been added',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
        action: 'view-project'
      },
      {
        id: '5',
        type: 'info',
        title: 'Review Submitted',
        message: 'New customer review received for Project #789',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        read: true,
        action: 'view-review'
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationAction = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Handle different notification actions
    switch (notification.action) {
      case 'view-order':
        console.log('Navigate to order:', notification.data?.orderId);
        break;
      case 'view-pending-payments':
        console.log('Navigate to pending payments');
        break;
      case 'view-user':
        console.log('Navigate to user profile');
        break;
      case 'view-project':
        console.log('Navigate to project');
        break;
      case 'view-review':
        console.log('Navigate to review');
        break;
      default:
        console.log('Notification action:', notification.action);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end p-4 z-50">
      <Card className="w-96 max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-white' : ''}`}
                    onClick={() => handleNotificationAction(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className={`text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>
                        
                        {!notification.read && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                <span>{unreadCount} unread</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 