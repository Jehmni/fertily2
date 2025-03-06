
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface UseEmbryoSubmissionProps {
  imageUrl: string | null;
  description: string;
  onSuccess: () => void;
}

export const useEmbryoSubmission = ({ imageUrl, description, onSuccess }: UseEmbryoSubmissionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call the analyze-embryo function
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-embryo', {
          body: { imageUrl, description }
        });

      if (analysisError) throw analysisError;

      // Store the analysis result
      const { error: dbError } = await supabase
        .from('embryo_data')
        .insert({
          expert_id: user.id,
          image_url: imageUrl,
          text_description: description,
          ai_score: analysis.confidenceScore,
          grade: analysis.analysis,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Embryo analysis completed successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error analyzing embryo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit, isLoading };
};
