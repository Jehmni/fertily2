
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageIcon, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const EmbryoSubmissionForm = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('embryo-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('embryo-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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

      // Reset form
      setImageUrl(null);
      setDescription("");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="image">Upload Embryo Image</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image')?.click()}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
          {imageUrl && <span className="text-sm text-muted-foreground">Image uploaded</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Embryo Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the embryo's characteristics..."
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" disabled={isLoading || (!imageUrl && !description)}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Analyze Embryo
          </>
        )}
      </Button>
    </form>
  );
};
