import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage = ({ message, isBot }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fadeIn",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4",
          isBot
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {message}
      </div>
    </div>
  );
};