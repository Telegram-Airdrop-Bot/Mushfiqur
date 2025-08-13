import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Shield, Settings, Users, FileText, Star, MessageSquare, BarChart3 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Dashboard } from '@/components/admin/Dashboard';
import { OrdersManagement } from '@/components/admin/OrdersManagement';
import { ContactMessagesManagement } from '@/components/admin/ContactMessagesManagement';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { ProjectsManagement } from '@/components/admin/ProjectsManagement';
import { ReviewsManagement } from '@/components/admin/ReviewsManagement';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { DynamicVisitorAnalytics } from '@/components/admin/DynamicVisitorAnalytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Check user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (roleData?.role === 'admin') {
            setUserRole('admin');
          } else {
            toast({
              title: "Access Denied",
              description: "You don't have admin permissions.",
              variant: "destructive",
            });
            navigate('/');
            return;
          }
        } else {
          navigate('/auth?admin=1');
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/auth?admin=1');
      } finally {
        setIsLoading(false);
      }

      // Set up auth state listener for future changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT') {
            navigate('/auth?admin=1');
          }
        }
      );

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
      <AdminHeader user={user} onSignOut={handleSignOut} />

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard onTabChange={handleTabChange} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="messages">
            <ContactMessagesManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsManagement />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <ErrorBoundary>
              <DynamicVisitorAnalytics />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}