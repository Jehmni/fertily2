
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";

export const useDraftAutosave = (initialData: {
  title: string;
  content: string;
  category: string;
}) => {
  const [autosaveTimeout, setAutosaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const saveDraftMutation = useMutation({
    mutationFn: (draft: { title: string; content: string; category: string }) =>
      CommunityService.saveDraft(draft.title, draft.content, draft.category),
    onError: (error: Error) => {
      console.error("Failed to save draft:", error);
    },
  });

  const autosave = (data: Partial<typeof initialData>) => {
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }

    const timeout = setTimeout(() => {
      saveDraftMutation.mutate({
        title: data.title || "",
        content: data.content || "",
        category: data.category || "",
      });
    }, 1500);

    setAutosaveTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }
    };
  }, [autosaveTimeout]);

  return { autosave };
};
