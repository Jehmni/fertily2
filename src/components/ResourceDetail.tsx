
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book } from "lucide-react";
import { Card } from "@/components/ui/card";

export const ResourceDetail = () => {
  const params = useParams();
  const resourceId = params.id;
  const navigate = useNavigate();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['educational-resource', resourceId],
    queryFn: async () => {
      if (!resourceId) throw new Error('Resource ID is required');
      
      const { data, error } = await supabase
        .from('educational_resources')
        .select()
        .single();
      
      if (error) {
        console.error('Error fetching resource:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!resourceId,
  });

  console.log('Resource:', resource); // Debug log

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading resource...</div>;
  }

  if (!resource) {
    return <div className="text-center py-8">Resource not found.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Book className="h-4 w-4" />
          All Resources
        </Button>
      </div>

      <Card className="p-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{resource.title}</h1>
          </div>
          
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{resource.category}</span>
            {resource.subcategory && (
              <>
                <span>•</span>
                <span>{resource.subcategory}</span>
              </>
            )}
          </div>

          <div className="prose prose-sm max-w-none mt-4">
            <div 
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: resource.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>

          {resource.content_url && (
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => window.open(resource.content_url, '_blank')}
            >
              Read more
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
