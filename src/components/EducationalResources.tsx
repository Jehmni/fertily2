import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const EducationalResources = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorited, setFavorited] = useState<Set<string>>(new Set());

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['educational-resources', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('educational_resources').select('*');
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      const { data, error } = await query.order('category');
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['resource-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('educational_resources')
        .select('category')
        .order('category');
      if (error) throw error;
      return Array.from(new Set(data.map(item => item.category)));
    },
  });

  const handleFavorite = async (resourceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to favorite resources",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('user_favorites').insert({
        user_id: user.id,
        content_type: 'educational_resource',
        content_id: resourceId,
      });

      if (error) throw error;
      
      setFavorited(prev => new Set([...prev, resourceId]));
      toast({
        title: "Success",
        description: "Added to favorites!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading resources...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="shrink-0"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-4">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{resource.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${favorited.has(resource.id) ? "text-primary" : ""} shrink-0`}
                  onClick={() => handleFavorite(resource.id)}
                >
                  <Heart className="h-4 w-4" fill={favorited.has(resource.id) ? "currentColor" : "none"} />
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground mb-4">
                <p>{resource.category}</p>
                {resource.subcategory && (
                  <p className="text-xs">{resource.subcategory}</p>
                )}
              </div>

              <div className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/resources/${resource.id}`)}
                >
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {resources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground col-span-full">
            No resources found for this category.
          </div>
        )}
      </div>
    </div>
  );
};