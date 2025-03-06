
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const ExpertOnboarding = () => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    specialization: "",
    qualifications: "",
    yearsOfExperience: "",
    consultationFee: "",
    bio: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const analyzeBioMutation = useMutation({
    mutationFn: async (bio: string) => {
      const response = await fetch("/functions/v1/analyze-embryo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ description: bio })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze bio");
      }

      return response.json();
    }
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, analyze the bio using OpenAI
      const analysis = await analyzeBioMutation.mutateAsync(formData.bio);
      console.log("Bio Analysis:", analysis);

      // Then, create the expert profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('expert_profiles')
        .insert({
          user_id: user.id,
          specialization: formData.specialization,
          qualifications: formData.qualifications.split(',').map(q => q.trim()),
          years_of_experience: parseInt(formData.yearsOfExperience),
          consultation_fee: parseFloat(formData.consultationFee),
          bio: formData.bio,
          availability: { "weekdays": ["Monday", "Wednesday", "Friday"] },
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expert profile created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w 2xl mx-auto">
      <CardHeader>
        <CardTitle>Medical Consultant Onboarding</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Reproductive Endocrinology"
              required
            />
          </div>

          <div>
            <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
            <Input
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="MD, PhD, FACOG"
              required
            />
          </div>

          <div>
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <Input
              id="yearsOfExperience"
              name="yearsOfExperience"
              type="number"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
            <Input
              id="consultationFee"
              name="consultationFee"
              type="number"
              value={formData.consultationFee}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write about your experience and expertise..."
              className="h-32"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={analyzeBioMutation.isPending}>
            {analyzeBioMutation.isPending ? "Creating Profile..." : "Create Expert Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
