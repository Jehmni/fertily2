
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from "lucide-react";

export const ExpertProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    yearsOfExperience: "",
    qualifications: "",
    consultationFee: "",
    bio: "",
    profileImage: "",
    availability: {}, // Added availability field with default empty object
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to access your profile",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      if (data) {
        setProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          specialization: data.specialization || "",
          yearsOfExperience: data.years_of_experience?.toString() || "",
          qualifications: Array.isArray(data.qualifications) ? data.qualifications.join(', ') : "",
          consultationFee: data.consultation_fee?.toString() || "",
          bio: data.bio || "",
          profileImage: data.profile_image || "",
          availability: data.availability || {},
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // First remove old image if it exists
      if (profile.profileImage) {
        const oldFileName = profile.profileImage.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('consultant-images')
            .remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('consultant-images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('consultant-images')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, profileImage: publicUrl }));

      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate required fields
      if (!profile.firstName || !profile.lastName || !profile.specialization || 
          !profile.consultationFee || !profile.bio || !profile.yearsOfExperience) {
        throw new Error("Please fill in all required fields");
      }

      const { error } = await supabase
        .from('expert_profiles')
        .upsert({
          user_id: user.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          specialization: profile.specialization,
          years_of_experience: parseInt(profile.yearsOfExperience) || 0,
          qualifications: profile.qualifications.split(',').map(q => q.trim()).filter(Boolean),
          consultation_fee: parseFloat(profile.consultationFee) || 0,
          bio: profile.bio,
          profile_image: profile.profileImage,
          availability: profile.availability, // Ensure availability is included in the update
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Expert Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Expert Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.profileImage} alt="Profile" />
                <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image"
                  disabled={loading}
                />
                <Label
                  htmlFor="profile-image"
                  className={`cursor-pointer flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-4 w-4" />
                  {loading ? "Uploading..." : "Upload Photo"}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Input
                id="specialization"
                value={profile.specialization}
                onChange={(e) => setProfile(p => ({ ...p, specialization: e.target.value }))}
                placeholder="e.g., Embryology, IVF Specialist"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
              <Input
                id="qualifications"
                value={profile.qualifications}
                onChange={(e) => setProfile(p => ({ ...p, qualifications: e.target.value }))}
                placeholder="e.g., MD, PhD, Board Certification"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  value={profile.yearsOfExperience}
                  onChange={(e) => setProfile(p => ({ ...p, yearsOfExperience: e.target.value }))}
                  placeholder="Enter years of experience"
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (USD) *</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  value={profile.consultationFee}
                  onChange={(e) => setProfile(p => ({ ...p, consultationFee: e.target.value }))}
                  placeholder="Enter consultation fee"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about your professional background and expertise..."
                className="min-h-[100px]"
                required
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                disabled={loading}
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
