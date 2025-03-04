
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { EmbryoData } from "@/types/user";

export const EmbryoAnalysis = ({ consultationId }: { consultationId: string }) => {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImage(file);
  };

  const analyzeEmbryo = async () => {
    try {
      setAnalyzing(true);
      
      let imageUrl = "";
      if (image) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('embryo-images')
          .upload(`${consultationId}/${Date.now()}`, image);
          
        if (uploadError) throw uploadError;
        imageUrl = uploadData.path;
      }

      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-embryo', {
          body: { imageUrl, description }
        });

      if (analysisError) throw analysisError;

      toast({
        title: "Analysis Complete",
        description: "Embryo analysis has been completed successfully.",
      });

      return analysisData;
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Embryo Analysis</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Embryo Image
          </label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="embryo-image"
            />
            <label htmlFor="embryo-image" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter embryo details and observations..."
            className="min-h-[100px]"
          />
        </div>

        <Button
          onClick={analyzeEmbryo}
          disabled={analyzing || (!image && !description)}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Progress value={undefined} className="mr-2" />
              Analyzing...
            </>
          ) : (
            "Analyze Embryo"
          )}
        </Button>
      </div>
    </Card>
  );
};
