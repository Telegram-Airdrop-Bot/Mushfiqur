import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Eye } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  email: string;
  role: 'admin' | 'user';
}

export function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Fetch profiles
      const [{ data: profilesData, error: profilesError }, { data: rolesData, error: rolesError }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_roles').select('user_id, role')
      ]);

      if (profilesError) throw profilesError;
      if (rolesError) throw rolesError;

      const userIdToRole = new Map<string, 'admin' | 'user'>();
      (rolesData || []).forEach((r: any) => {
        // If multiple roles exist, prefer 'admin'
        const current = userIdToRole.get(r.user_id);
        if (current === 'admin') return;
        userIdToRole.set(r.user_id, r.role);
      });

      const usersWithRoles: UserProfile[] = (profilesData || []).map((profile: any) => ({
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        email: 'Email hidden (security)',
        role: (userIdToRole.get(profile.user_id) || 'user') as 'admin' | 'user',
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole }]);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="text-sm text-muted-foreground">
          Total Users: {users.length} | 
          Admins: {users.filter(u => u.role === 'admin').length} | 
          Users: {users.filter(u => u.role === 'user').length}
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {user.display_name || 'No name set'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="mr-1 h-3 w-3" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="mr-1 h-3 w-3" />
                      User
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>User ID:</strong> {user.user_id.slice(0, 8)}...
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Role:</span>
                    <Select
                      value={user.role}
                      onValueChange={(value: 'admin' | 'user') => updateUserRole(user.user_id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No users found.
        </div>
      )}
    </div>
  );
}