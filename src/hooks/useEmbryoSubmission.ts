
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface UseEmbryoSubmissionProps {
  imageUrl: string | null;
  description: string;
  patientAge: number | null;
  previousIvfAttempts: number | null;
  ivfSuccessHistory: string;
  underlyingConditions: string[];
  embryoIdentifier: string;
  developmentDay: number | null;
  blastocystExpansionGrade: string;
  innerCellMassGrade: string;
  trophectodermGrade: string;
  zonaPellucidaThickness: number | null;
  cellNumber: number | null;
  fragmentationPercentage: number | null;
  symmetryScore: number | null;
  cytoplasmicAppearance: string;
  hasMultinucleation: boolean;
  onSuccess: () => void;
}

export const useEmbryoSubmission = ({ 
  imageUrl, 
  description,
  patientAge,
  previousIvfAttempts,
  ivfSuccessHistory,
  underlyingConditions,
  embryoIdentifier,
  developmentDay,
  blastocystExpansionGrade,
  innerCellMassGrade,
  trophectodermGrade,
  zonaPellucidaThickness,
  cellNumber,
  fragmentationPercentage,
  symmetryScore,
  cytoplasmicAppearance,
  hasMultinucleation,
  onSuccess 
}: UseEmbryoSubmissionProps) => {
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
          body: { 
            imageUrl, 
            description,
            embryoIdentifier,
            developmentDay,
            blastocystExpansionGrade,
            innerCellMassGrade,
            trophectodermGrade,
            zonaPellucidaThickness,
            cellNumber,
            fragmentationPercentage,
            symmetryScore,
            cytoplasmicAppearance,
            hasMultinucleation
          }
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
          patient_age: patientAge,
          previous_ivf_attempts: previousIvfAttempts,
          ivf_success_history: ivfSuccessHistory,
          underlying_conditions: underlyingConditions,
          embryo_identifier: embryoIdentifier,
          development_day: developmentDay,
          blastocyst_expansion_grade: blastocystExpansionGrade,
          inner_cell_mass_grade: innerCellMassGrade,
          trophectoderm_grade: trophectodermGrade,
          zona_pellucida_thickness: zonaPellucidaThickness,
          cell_number: cellNumber,
          fragmentation_percentage: fragmentationPercentage,
          symmetry_score: symmetryScore,
          cytoplasmic_appearance: cytoplasmicAppearance,
          has_multinucleation: hasMultinucleation,
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
