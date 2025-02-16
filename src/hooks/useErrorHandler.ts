import { useToast } from "@/components/ui/use-toast";
import { AppError, AuthError } from "@/lib/errors";
import { analytics } from "@/lib/analytics";
import { useNavigate } from "react-router-dom";

export const useErrorHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleError = (error: unknown) => {
    console.error('Error caught:', error);

    // Track error in analytics
    analytics.error(error as Error);

    if (error instanceof AuthError) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (error instanceof AppError) {
      toast({
        title: error.name,
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Handle unknown errors
    toast({
      title: "Unexpected Error",
      description: "An unexpected error occurred. Please try again later.",
      variant: "destructive",
    });
  };

  return { handleError };
}; 