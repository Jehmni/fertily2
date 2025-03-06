
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const ExpertProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    yearsOfExperience: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          specialization: data.specialization || "",
          yearsOfExperience: data.years_of_experience?.toString() || "",
          bio: data.bio || "",
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('expert_profiles')
        .upsert({
          user_id: user.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          specialization: profile.specialization,
          years_of_experience: parseInt(profile.yearsOfExperience) || 0,
          bio: profile.bio,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Expert Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={profile.specialization}
                onChange={(e) => setProfile(p => ({ ...p, specialization: e.target.value }))}
                placeholder="e.g., Embryology, IVF Specialist"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                value={profile.yearsOfExperience}
                onChange={(e) => setProfile(p => ({ ...p, yearsOfExperience: e.target.value }))}
                placeholder="Enter years of experience"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about your professional background and expertise..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
