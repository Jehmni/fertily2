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
    meta: {
      onError: (error: Error) => {
        console.error('Failed to load chat history:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history. Please try refreshing the page.",
          variant: "destructive",
        });
      },
    },
  });

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (message: string) => {
      try {
        // Immediately update UI with user message
        queryClient.setQueryData(['chatHistory'], (old: ChatMessage[] = []) => [
          ...old,
          { text: message, isBot: false },
        ]);

        const response = await ChatService.sendMessage(message);
        await ChatService.saveChatMessage(message, response);
        return { message, response };
      } catch (error) {
        console.error('Message handling error:', error);
        throw error;
      }
    },
    onSuccess: ({ message, response }) => {
      queryClient.setQueryData(['chatHistory'], (old: ChatMessage[] = []) => {
        // Filter out any temporary messages
        const filteredMessages = old.filter(msg => 
          !(msg.text === message && !msg.isBot)
        );
        return [
          ...filteredMessages,
          { text: message, isBot: false },
          { text: response, isBot: true },
        ];
      });
    },
    onError: (error: Error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove the temporary message on error
      queryClient.setQueryData(['chatHistory'], (old: ChatMessage[] = []) => {
        return old.filter(msg => msg.isBot);
      });
    },
  });

  return {
    messages,
    isLoading: isLoadingHistory,
    isSending,
    sendMessage,
  };
};