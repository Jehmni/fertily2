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

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['educational-resources', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('educational_resources').select('*');
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['resource-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('educational_resources')
        .select('category', { count: 'exact' })
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
    return <div>Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-4">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {resources.map((resource) => (
          <AccordionItem key={resource.id} value={resource.id} className="border rounded-lg bg-card">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{resource.title}</h3>
                  <p className="text-sm text-gray-500">{resource.category}</p>
                  {resource.subcategory && (
                    <p className="text-xs text-gray-400">{resource.subcategory}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(resource.id);
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="mt-2 text-sm">{resource.content}</p>
              {resource.content_url && (
                <Button
                  variant="link"
                  className="mt-2 p-0"
                  onClick={() => window.open(resource.content_url, '_blank')}
                >
                  Read more
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};