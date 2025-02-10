
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService, type ChatMessage } from "@/services/ChatService";
import { useToast } from "@/components/ui/use-toast";
import { VoiceService } from "@/services/VoiceService";

export const useChatHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: messages = [
      {
        text: "Hello! I'm your fertility assistant. How can I help you today?",
        isBot: true,
        wasSpoken: false,
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
    mutationFn: async ({ message, wasSpoken }: { message: string; wasSpoken: boolean }) => {
      try {
        // Immediately update UI with user message
        queryClient.setQueryData(['chatHistory'], (old: ChatMessage[] = []) => [
          ...old,
          { text: message, isBot: false, wasSpoken },
        ]);

        console.log('Sending message:', { message, wasSpoken });
        const response = await ChatService.sendMessage(message, wasSpoken);
        console.log('Received AI response:', response);
        
        // If this was a spoken message, convert response to speech and play it
        if (wasSpoken) {
          console.log('Converting response to speech...');
          try {
            const audioContent = await VoiceService.textToSpeech(response);
            console.log('Received audio content, length:', audioContent?.length);
            
            if (!audioContent) {
              throw new Error('No audio content received');
            }

            const audio = new Audio();
            audio.src = `data:audio/mp3;base64,${audioContent}`;
            
            // Add event listeners for better error handling
            audio.onerror = (e) => {
              console.error('Audio playback error:', e);
              throw new Error('Failed to play audio');
            };
            
            audio.onloadeddata = () => {
              console.log('Audio loaded successfully');
            };

            await audio.play();
            console.log('Audio playback started');
          } catch (error) {
            console.error('Error with audio response:', error);
            toast({
              title: "Error",
              description: "Failed to play audio response. Please try again.",
              variant: "destructive",
            });
          }
        }

        await ChatService.saveChatMessage(message, response, wasSpoken);
        return { message, response, wasSpoken };
      } catch (error) {
        console.error('Message handling error:', error);
        throw error;
      }
    },
    onSuccess: ({ message, response, wasSpoken }) => {
      queryClient.setQueryData(['chatHistory'], (old: ChatMessage[] = []) => {
        // Filter out any temporary messages
        const filteredMessages = old.filter(msg => 
          !(msg.text === message && !msg.isBot)
        );
        return [
          ...filteredMessages,
          { text: message, isBot: false, wasSpoken },
          { text: response, isBot: true, wasSpoken },
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
