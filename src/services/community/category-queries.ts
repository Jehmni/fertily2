
import { supabase } from "@/lib/supabase";

export const categoryQueries = {
  getCategories: () =>
    supabase
      .from('post_categories')
      .select('*')
      .order('name', { ascending: true })
};
