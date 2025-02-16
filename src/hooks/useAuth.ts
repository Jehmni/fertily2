import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';

export const useAuth = () => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => apiClient.auth.getSession(),
  });

  const signOut = useMutation({
    mutationFn: () => apiClient.auth.signOut(),
    onSuccess: () => navigate('/auth'),
  });

  return {
    user: session?.user,
    isAuthenticated: !!session,
    signOut: signOut.mutate,
  };
}; 