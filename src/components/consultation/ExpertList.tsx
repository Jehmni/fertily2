
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { ExpertProfile } from "@/types/user";
import { supabase } from "@/lib/supabase";

export const ExpertList = () => {
  const { data: experts, isLoading } = useQuery({
    queryKey: ['experts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data as ExpertProfile[];
    }
  });

  if (isLoading) return <div>Loading experts...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {experts?.map((expert) => (
        <Card key={expert.id} className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <img src={expert.profileImage} alt={`Dr. ${expert.userId}`} />
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Dr. {expert.userId}</h3>
              <p className="text-sm text-muted-foreground">{expert.specialization}</p>
              <div className="flex items-center mt-2">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span className="ml-1">{expert.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({expert.totalReviews} reviews)
                </span>
              </div>
              <p className="text-sm mt-2">{expert.bio.substring(0, 100)}...</p>
            </div>
          </div>
          <div className="mt-4">
            <Button className="w-full">Book Consultation</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
