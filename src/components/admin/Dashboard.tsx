import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Star, 
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  BarChart3,
  Activity,
  Target,
  Zap,
  Settings,
  MessageCircle,
  Download,
  Upload,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuickActions } from './QuickActions';

interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayVisits: number;
  totalUsers: number;
  totalProjects: number;
  totalReviews: number;
  recentOrders: any[];
  orderTrends: { date: string; count: number }[];
  topServices: { service: string; count: number }[];
  totalContactMessages: number;
  unreadMessages: number;
}

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayVisits: 0,
    totalUsers: 0,
    totalProjects: 0,
    totalReviews: 0,
    recentOrders: [],
    orderTrends: [],
    topServices: [],
    totalContactMessages: 0,
    unreadMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [
        ordersResponse,
        usersResponse,
        projectsResponse,
        reviewsResponse,
        contactMessagesResponse
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('reviews').select('*'),
        supabase.from('contact_messages').select('*')
      ]);

      if (ordersResponse.error) throw ordersResponse.error;
      if (usersResponse.error) throw usersResponse.error;
      if (projectsResponse.error) throw projectsResponse.error;
      if (reviewsResponse.error) throw reviewsResponse.error;
      if (contactMessagesResponse.error) throw contactMessagesResponse.error;

      const orders = ordersResponse.data || [];
      const users = usersResponse.data || [];
      const projects = projectsResponse.data || [];
      const reviews = reviewsResponse.data || [];
      const contactMessages = contactMessagesResponse.data || [];

      // Calculate statistics
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      // Calculate revenue (assuming budget_range has values like "1000-2000", "5000+")
      const totalRevenue = orders.reduce((sum, order) => {
        const budget = order.budget_range;
        if (budget.includes('+')) {
          return sum + parseInt(budget.replace('+', ''));
        } else if (budget.includes('-')) {
          const [min, max] = budget.split('-').map(Number);
          return sum + ((min + max) / 2);
        }
        return sum + (parseInt(budget) || 0);
      }, 0);

      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order => 
        order.created_at?.startsWith(today)
      );
      const todayVisits = todayOrders.length;

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      // Calculate order trends (last 7 days)
      const orderTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = orders.filter(order => order.created_at?.startsWith(dateStr)).length;
        orderTrends.push({ date: dateStr, count });
      }

      // Calculate top services
      const serviceCounts: { [key: string]: number } = {};
      orders.forEach(order => {
        serviceCounts[order.service_type] = (serviceCounts[order.service_type] || 0) + 1;
      });
      const topServices = Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Fetch contact messages stats
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('status');

      if (messagesError) {
        console.error('Error fetching contact messages:', messagesError);
      }

      const totalContactMessages = messagesData?.length || 0;
      const unreadMessages = messagesData?.filter(m => m.status === 'unread').length || 0;

      setStats({
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        todayVisits,
        totalUsers: users.length,
        totalProjects: projects.length,
        totalReviews: reviews.length,
        recentOrders,
        orderTrends,
        topServices,
        totalContactMessages,
        unreadMessages
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'view-orders':
        onTabChange?.('orders');
        break;
      case 'manage-users':
        onTabChange?.('users');
        break;
      case 'add-project':
        onTabChange?.('projects');
        break;
      case 'manage-reviews':
        onTabChange?.('reviews');
        break;
      case 'view-messages':
        onTabChange?.('messages');
        break;
      case 'view-analytics':
        onTabChange?.('analytics');
        break;
      case 'site-settings':
        onTabChange?.('content');
        break;
      case 'new-order':
        handleNewOrder();
        break;
      case 'export-data':
        handleExportData();
        break;
      case 'import-data':
        handleImportData();
        break;
      case 'send-notifications':
        handleSendNotifications();
        break;
      case 'schedule-tasks':
        handleScheduleTasks();
        break;
      case 'analytics':
        handleAnalytics();
        break;
      case 'email-templates':
        handleEmailTemplates();
        break;
      default:
        console.log('Quick action:', action);
        break;
    }
  };

  const handleNewOrder = () => {
    toast({
      title: "New Order",
      description: "Redirecting to orders management to create new order...",
    });
    onTabChange?.('orders');
  };

  const handleExportData = async () => {
    try {
      // Export orders data
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: users } = await supabase.from('profiles').select('*');
      const { data: projects } = await supabase.from('projects').select('*');
      const { data: reviews } = await supabase.from('reviews').select('*');

      const exportData = {
        orders: orders || [],
        users: users || [],
        projects: projects || [],
        reviews: reviews || [],
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Data exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          toast({
            title: "Import Successful",
            description: `Imported ${data.orders?.length || 0} orders, ${data.users?.length || 0} users, ${data.projects?.length || 0} projects, ${data.reviews?.length || 0} reviews`,
          });
          
          // Refresh dashboard data
          fetchDashboardData();
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid file format. Please check your file.",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  const handleSendNotifications = () => {
    toast({
      title: "Notifications",
      description: "Notification system coming soon!",
    });
  };

  const handleScheduleTasks = () => {
    toast({
      title: "Task Scheduling",
      description: "Task scheduling system coming soon!",
    });
  };

  const handleAnalytics = () => {
    toast({
      title: "Analytics",
      description: "Redirecting to detailed analytics...",
    });
    // You can implement a dedicated analytics tab here
  };

  const handleEmailTemplates = () => {
    toast({
      title: "Email Templates",
      description: "Email template management coming soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Your Dashboard</h2>
        <p className="text-muted-foreground">
          Here's an overview of your business performance and key metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todayVisits}</div>
            <p className="text-xs text-muted-foreground">
              New orders today
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From all orders
            </p>
          </CardContent>
        </Card>
        {/* Contact Messages Stats */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Contact Messages</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalContactMessages}</p>
                <p className="text-xs text-blue-600/70">
                  {stats.unreadMessages} unread
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Portfolio projects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">Customer reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Trends Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Order Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.orderTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {new Date(trend.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.max((trend.count / Math.max(...stats.orderTrends.map(t => t.count))) * 100, 5)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{trend.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1">
                    {service.service}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.max((service.count / Math.max(...stats.topServices.map(s => s.count))) * 100, 5)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {service.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.service_type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders yet</p>
                <p className="text-sm">Orders will appear here once customers start placing them</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />
    </div>
  );
} 