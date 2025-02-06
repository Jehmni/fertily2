import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export const UserFavorites = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['user-favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorites')
        .select(`
          *,
          educational_resources (*)
        `)
        .eq('user_id', user.id);
      
      if (favoritesError) throw favoritesError;
      return favoritesData;
    },
  });

  const { mutate: removeFavorite } = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading favorites...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link 
                  to={`/resources/${favorite.educational_resources?.id}`}
                  className="hover:text-primary transition-colors"
                >
                  <h3 className="text-lg font-semibold">
                    {favorite.educational_resources?.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500">
                  {favorite.educational_resources?.category}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFavorite(favorite.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm line-clamp-3">
              {favorite.educational_resources?.content}
            </p>
          </Card>
        ))}
        {favorites.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center py-8">
            You haven't added any favorites yet.
          </p>
        )}
      </div>
    </div>
  );
};