import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService, type ChatMessage } from "@/services/ChatService";
import { useToast } from "@/components/ui/use-toast";

export const useChatHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: messages = [
      {
        text: "Hello! I'm your fertility assistant. How can I help you today?",
        isBot: true,
      },
    ],
    isLoading: isLoadingHistory,
  } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: ChatService.loadChatHistory,
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    },
  });

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await ChatService.sendMessage(message);
      await ChatService.saveChatMessage(message, response);
      return { message, response };
    },
    onSuccess: ({ message, response }) => {
      queryClient.setQueryData(['chatHistory'], (old: ChatMessage[] = []) => [
        ...old,
        { text: message, isBot: false },
        { text: response, isBot: true },
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      queryClient.setQueryData(['chatHistory'], (old: ChatMessage[] = []) => [
        ...old,
        { 
          text: "I apologize, but I encountered an error processing your message. Please try again.",
          isBot: true 
        },
      ]);
    },
  });

  return {
    messages,
    isLoading: isLoadingHistory,
    isSending,
    sendMessage,
  };
};