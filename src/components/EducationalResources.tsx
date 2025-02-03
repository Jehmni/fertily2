import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const EducationalResources = () => {
  const { toast } = useToast();
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

      <Accordion type="single" collapsible className="space-y-4">
        {resources.map((resource) => (
          <AccordionItem 
            key={resource.id} 
            value={resource.id} 
            className="border rounded-lg bg-card shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.category}</p>
                  {resource.subcategory && (
                    <p className="text-xs text-muted-foreground">{resource.subcategory}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${favorited.has(resource.id) ? "text-primary" : ""} shrink-0`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(resource.id);
                  }}
                >
                  <Heart className="h-4 w-4" fill={favorited.has(resource.id) ? "currentColor" : "none"} />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="prose prose-sm max-w-none mt-2 space-y-4">
                <div className="whitespace-pre-wrap break-words">{resource.content}</div>
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
            </AccordionContent>
          </AccordionItem>
        ))}
        {resources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No resources found for this category.
          </div>
        )}
      </Accordion>
    </div>
  );
};