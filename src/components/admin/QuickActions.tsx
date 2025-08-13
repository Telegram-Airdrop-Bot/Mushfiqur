import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Users, 
  Star, 
  MessageSquare, 
  Settings, 
  Download, 
  Upload,
  Mail,
  Bell,
  BarChart3,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  color?: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const handleAction = async (actionId: string) => {
    setLoadingActions(prev => new Set(prev).add(actionId));
    
    try {
      // Simulate some actions taking time
      if (['export-data', 'import-data', 'send-notifications'].includes(actionId)) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      switch (actionId) {
        case 'new-order':
          onAction('new-order');
          break;
        case 'view-orders':
          onAction('view-orders');
          break;
        case 'manage-users':
          onAction('manage-users');
          break;
        case 'add-project':
          onAction('add-project');
          break;
        case 'manage-reviews':
          onAction('manage-reviews');
          break;
        case 'view-messages':
          onAction('view-messages');
          break;
        case 'site-settings':
          onAction('site-settings');
          break;
        case 'export-data':
          onAction('export-data');
          break;
        case 'import-data':
          onAction('import-data');
          break;
        case 'send-notifications':
          onAction('send-notifications');
          break;
        case 'schedule-tasks':
          onAction('schedule-tasks');
          break;
        case 'analytics':
          onAction('analytics');
          break;
        case 'email-templates':
          onAction('email-templates');
          break;
      }
      
      // Mark as completed for visual feedback
      setCompletedActions(prev => new Set(prev).add(actionId));
      
      // Remove from completed after a delay
      setTimeout(() => {
        setCompletedActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionId);
          return newSet;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-order',
      title: 'New Order',
      description: 'Create a new order manually',
      icon: <Plus className="h-6 w-6" />,
      action: () => handleAction('new-order'),
      variant: 'default',
      color: 'bg-blue-500 hover:bg-blue-600',
      badge: 'Hot'
    },
    {
      id: 'view-orders',
      title: 'View Orders',
      description: 'See all orders and manage them',
      icon: <FileText className="h-6 w-6" />,
      action: () => handleAction('view-orders'),
      variant: 'outline',
      badge: `${Math.floor(Math.random() * 10) + 1} new`
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <Users className="h-6 w-6" />,
      action: () => handleAction('manage-users'),
      variant: 'outline'
    },
    {
      id: 'add-project',
      title: 'Add Project',
      description: 'Add new project to portfolio',
      icon: <Star className="h-6 w-6" />,
      action: () => handleAction('add-project'),
      variant: 'outline'
    },
    {
      id: 'manage-reviews',
      title: 'Manage Reviews',
      description: 'Approve and manage customer reviews',
      icon: <MessageSquare className="h-6 w-6" />,
      action: () => handleAction('manage-reviews'),
      variant: 'outline',
      badge: `${Math.floor(Math.random() * 5) + 1} pending`
    },
    {
      id: 'view-messages',
      title: 'Contact Messages',
      description: 'View and manage contact form submissions',
      icon: <MessageCircle className="h-6 w-6" />,
      action: () => handleAction('view-messages'),
      variant: 'outline',
      badge: 'New'
    },
    {
      id: 'site-settings',
      title: 'Site Settings',
      description: 'Configure website settings',
      icon: <Settings className="h-6 w-6" />,
      action: () => handleAction('site-settings'),
      variant: 'outline'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download orders and analytics',
      icon: <Download className="h-6 w-6" />,
      action: () => handleAction('export-data'),
      variant: 'secondary'
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Upload data from external sources',
      icon: <Upload className="h-6 w-6" />,
      action: () => handleAction('import-data'),
      variant: 'secondary'
    },
    {
      id: 'send-notifications',
      title: 'Send Notifications',
      description: 'Send bulk notifications to users',
      icon: <Bell className="h-6 w-6" />,
      action: () => handleAction('send-notifications'),
      variant: 'secondary',
      badge: 'New'
    },
    {
      id: 'schedule-tasks',
      title: 'Schedule Tasks',
      description: 'Set up automated tasks',
      icon: <Calendar className="h-6 w-6" />,
      action: () => handleAction('schedule-tasks'),
      variant: 'secondary'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: <BarChart3 className="h-6 w-6" />,
      action: () => handleAction('analytics'),
      variant: 'secondary'
    },
    {
      id: 'email-templates',
      title: 'Email Templates',
      description: 'Manage email notification templates',
      icon: <Mail className="h-6 w-6" />,
      action: () => handleAction('email-templates'),
      variant: 'secondary'
    }
  ];

  const getActionButton = (action: QuickAction) => {
    const isLoading = loadingActions.has(action.id);
    const isCompleted = completedActions.has(action.id);
    const baseClasses = "h-20 flex-col gap-2 transition-all duration-200 hover:scale-105 relative";
    
    // Determine icon based on state
    let icon = action.icon;
    if (isLoading) {
      icon = <Loader2 className="h-6 w-6 animate-spin" />;
    } else if (isCompleted) {
      icon = <CheckCircle className="h-6 w-6 text-green-600" />;
    }
    
    // Determine button content
    let buttonContent = (
      <>
        {icon}
        <span className="font-medium">{action.title}</span>
        {action.badge && (
          <Badge 
            variant="secondary" 
            className={`absolute top-2 right-2 text-xs ${action.badgeColor || 'bg-primary text-primary-foreground'}`}
          >
            {action.badge}
          </Badge>
        )}
      </>
    );

    if (action.variant === 'default') {
      return (
        <Button 
          key={action.id}
          onClick={action.action}
          disabled={isLoading}
          className={`${baseClasses} ${action.color} ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {buttonContent}
        </Button>
      );
    }

    return (
      <Button 
        key={action.id}
        variant={action.variant}
        onClick={action.action}
        disabled={isLoading}
        className={`${baseClasses} ${isCompleted ? 'bg-green-100 text-green-800 border-green-300' : ''}`}
      >
        {buttonContent}
      </Button>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
          <Badge variant="outline" className="ml-2">
            {quickActions.length} actions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map(getActionButton)}
        </div>
        
        {/* Action Status Summary */}
        {loadingActions.size > 0 && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                {loadingActions.size} action{loadingActions.size > 1 ? 's' : ''} in progress...
              </span>
            </div>
          </div>
        )}
        
        {completedActions.size > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {completedActions.size} action{completedActions.size > 1 ? 's' : ''} completed successfully!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 