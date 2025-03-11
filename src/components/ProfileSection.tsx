import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PersonalInfoForm } from "./profile/PersonalInfoForm";
import { CycleInfoForm } from "./profile/CycleInfoForm";
import { MedicalInfoForm } from "./profile/MedicalInfoForm";
import { AvatarForm } from "./profile/AvatarForm";
import { useProfile } from "@/hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, UserIcon, ImageIcon, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { EmbryoSubmissionForm } from "./consultation/EmbryoSubmissionForm";

export const ProfileSection = () => {
  const navigate = useNavigate();
  const { 
    profile, 
    setProfile, 
    loading, 
    isUpdate, 
    loadProfile, 
    handleSubmit 
  } = useProfile();

  const { data: consultants } = useQuery({
    queryKey: ['consultants'],
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

  const { data: myConsultations } = useQuery({
    queryKey: ['myConsultations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          expert:expert_id (
            id,
            email
          )
        `)
        .eq('patient_id', user.id)
        .order('scheduled_for', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: myEmbryoAnalyses } = useQuery({
    queryKey: ['myEmbryoAnalyses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('embryo_data')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: userRole } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return user.user_metadata?.role || 'patient';
    }
  });

  const { data: expertProfile } = useQuery({
    queryKey: ['expertProfile'],
    enabled: userRole === 'consultant',
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            {profile?.firstName} {profile?.lastName}
          </p>
        </div>
        {userRole === 'consultant' && (
          <Button onClick={() => navigate("/expert/profile")}>
            <Settings className="w-4 h-4 mr-2" />
            Edit Expert Profile
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="chat">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="community">
            <UserIcon className="w-4 h-4 mr-2" />
            Community
          </TabsTrigger>
          {userRole === 'patient' && (
            <TabsTrigger value="consultants">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Find Consultants
            </TabsTrigger>
          )}
          <TabsTrigger value="consultations">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {userRole === 'consultant' ? 'Appointments' : 'My Consultations'}
          </TabsTrigger>
          <TabsTrigger value="embryo">
            <ImageIcon className="w-4 h-4 mr-2" />
            Embryo Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
            
            <AvatarForm
              avatarUrl={profile.avatarUrl}
              avatarColor={profile.avatarColor}
              firstName={profile.firstName}
              lastName={profile.lastName}
              onAvatarUrlChange={(url) => setProfile(p => ({ ...p, avatarUrl: url }))}
              onAvatarColorChange={(color) => setProfile(p => ({ ...p, avatarColor: color }))}
            />

            <PersonalInfoForm
              firstName={profile.firstName}
              lastName={profile.lastName}
              dateOfBirth={profile.dateOfBirth}
              onFirstNameChange={(value) => setProfile(p => ({ ...p, firstName: value }))}
              onLastNameChange={(value) => setProfile(p => ({ ...p, lastName: value }))}
              onDateOfBirthChange={(date) => setProfile(p => ({ ...p, dateOfBirth: date }))}
            />

            <CycleInfoForm
              cycleLength={profile.cycleLength}
              lastPeriodDate={profile.lastPeriodDate}
              onCycleLengthChange={(value) => setProfile(p => ({ ...p, cycleLength: value }))}
              onLastPeriodDateChange={(date) => setProfile(p => ({ ...p, lastPeriodDate: date }))}
            />

            <MedicalInfoForm
              medicalConditions={profile.medicalConditions}
              medications={profile.medications}
              fertilityGoals={profile.fertilityGoals}
              onMedicalConditionsChange={(value) => setProfile(p => ({ ...p, medicalConditions: value }))}
              onMedicationsChange={(value) => setProfile(p => ({ ...p, medications: value }))}
              onFertilityGoalsChange={(value) => setProfile(p => ({ ...p, fertilityGoals: value }))}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : (isUpdate ? "Update Profile" : "Save Profile")}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="chat">
          Chat Component
        </TabsContent>

        <TabsContent value="community">
          Community Component
        </TabsContent>

        {userRole === 'patient' && (
          <TabsContent value="consultants">
            <div className="grid gap-4">
              {consultants?.map((consultant) => (
                <Card key={consultant.id}>
                  <CardHeader>
                    <CardTitle>{consultant.first_name} {consultant.last_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{consultant.specialization}</p>
                    <p>{consultant.years_of_experience} years of experience</p>
                    <p className="mt-2">{consultant.bio}</p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate(`/book-consultation/${consultant.user_id}`)}
                    >
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="consultations">
          <div className="grid gap-4">
            {myConsultations?.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <CardTitle>
                    Consultation on {new Date(consultation.scheduled_for).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Status: {consultation.status}</p>
                  {consultation.notes && <p className="mt-2">{consultation.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="embryo">
          {userRole === 'consultant' ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Submit New Embryo Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmbryoSubmissionForm />
                </CardContent>
              </Card>

              <div className="grid gap-4 mt-6">
                {myEmbryoAnalyses?.map((analysis) => (
                  <Card key={analysis.id}>
                    <CardHeader>
                      <CardTitle>Embryo Analysis #{analysis.id.slice(0, 8)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis.image_url && (
                        <img 
                          src={analysis.image_url} 
                          alt="Embryo" 
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <p>Grade: {analysis.grade}</p>
                      <p>AI Score: {analysis.ai_score}</p>
                      {analysis.notes && <p className="mt-2">{analysis.notes}</p>}
                      <Button 
                        className="mt-4"
                        onClick={() => navigate(`/embryo-analysis/${analysis.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="grid gap-4">
              {myEmbryoAnalyses?.map((analysis) => (
                <Card key={analysis.id}>
                  <CardHeader>
                    <CardTitle>Embryo Analysis #{analysis.id.slice(0, 8)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.image_url && (
                      <img 
                        src={analysis.image_url} 
                        alt="Embryo" 
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <p>Grade: {analysis.grade}</p>
                    <p>AI Score: {analysis.ai_score}</p>
                    {analysis.notes && <p className="mt-2">{analysis.notes}</p>}
                    <Button 
                      className="mt-4"
                      onClick={() => navigate(`/embryo-analysis/${analysis.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
