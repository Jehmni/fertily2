
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const UserRoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_users');
      if (error) throw error;
      return data;
    }
  });

  const { data: consultants = [], isLoading: consultantsLoading } = useQuery({
    queryKey: ['allConsultants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `);
      if (error) throw error;
      return data;
    }
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('toggle_user_admin', {
        target_user_id: userId
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleConsultantStatusMutation = useMutation({
    mutationFn: async ({ userId, isConsultant }: { userId: string; isConsultant: boolean }) => {
      if (isConsultant) {
        // Remove consultant status
        const { error } = await supabase
          .from('expert_profiles')
          .delete()
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Add consultant status
        const { error } = await supabase
          .from('expert_profiles')
          .insert({
            user_id: userId,
            specialization: 'General',
            qualifications: [],
            years_of_experience: 0,
            consultation_fee: 0,
            availability: {},
            bio: ''
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allConsultants'] });
      toast({
        title: "Success",
        description: "Consultant status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConsultants = consultants.filter(consultant =>
    consultant.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${consultant.first_name} ${consultant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usersLoading || consultantsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="consultants">Consultants</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.first_name} {user.last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? 'Admin' : 'User'}
                    </TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Switch
                          checked={user.is_admin}
                          onCheckedChange={() => toggleAdminMutation.mutate(user.id)}
                          disabled={toggleAdminMutation.isPending}
                        />
                        <Switch
                          checked={consultants.some(c => c.user_id === user.id)}
                          onCheckedChange={() => toggleConsultantStatusMutation.mutate({
                            userId: user.id,
                            isConsultant: consultants.some(c => c.user_id === user.id)
                          })}
                          disabled={toggleConsultantStatusMutation.isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="consultants">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{consultant.user?.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {consultant.first_name} {consultant.last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{consultant.specialization}</TableCell>
                    <TableCell>{consultant.years_of_experience} years</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline"
                        onClick={() => toggleConsultantStatusMutation.mutate({
                          userId: consultant.user_id,
                          isConsultant: true
                        })}
                      >
                        Remove Consultant Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
