
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Search, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  last_sign_in: string | null;
  auth_provider: string;
};

export const UserRoleManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    isAdmin: boolean;
  }>({ open: false, userId: "", isAdmin: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const filterUsers = () => {
    const filtered = users.filter(user => {
      const searchString = `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
    setFilteredUsers(filtered);
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get all users from auth.users via admin role
      const { data: authUsers, error: usersError } = await supabase
        .from('user_roles')
        .select('user_id, profiles!inner(email, created_at)');

      if (usersError) throw usersError;

      const combinedUsers = profiles.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        created_at: profile.created_at,
        isAdmin: roles.some((role: any) => 
          role.user_id === profile.id && role.role === 'admin'
        ),
        last_sign_in: null, // We'll add this if needed
        auth_provider: "email" // Default value
      }));

      setUsers(combinedUsers);
      setFilteredUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logRoleChange = async (userId: string, oldRole: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('role_change_logs')
        .insert({
          changed_by_id: (await supabase.auth.getUser()).data.user?.id,
          target_user_id: userId,
          old_role: oldRole,
          new_role: newRole
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging role change:', error);
    }
  };

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    try {
      setUpdating(userId);

      if (currentIsAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
        await logRoleChange(userId, 'admin', 'user');
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin'
          });

        if (error) throw error;
        await logRoleChange(userId, 'user', 'admin');
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !currentIsAdmin }
          : user
      ));

      toast({
        title: "Success",
        description: `Admin privileges ${currentIsAdmin ? 'removed from' : 'granted to'} user`,
      });
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: "Error",
        description: "Failed to update admin privileges",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
      setConfirmDialog({ open: false, userId: "", isAdmin: false });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
          <CardDescription>Manage admin privileges for users</CardDescription>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Admin Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div>{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {user.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <span className="text-green-600 font-medium">Admin</span>
                    ) : (
                      <span className="text-gray-500">Regular User</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.isAdmin}
                        disabled={updating === user.id}
                        onCheckedChange={() => setConfirmDialog({
                          open: true,
                          userId: user.id,
                          isAdmin: user.isAdmin
                        })}
                      />
                      {updating === user.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmationDialog
        icon={AlertTriangle}
        title="Change Admin Privileges"
        description={`Are you sure you want to ${confirmDialog.isAdmin ? 'remove' : 'grant'} admin privileges ${confirmDialog.isAdmin ? 'from' : 'to'} this user?`}
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        onConfirm={() => toggleAdminRole(confirmDialog.userId, confirmDialog.isAdmin)}
        variant="destructive"
      />
    </>
  );
};
