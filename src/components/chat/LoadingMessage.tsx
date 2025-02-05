import { Loader2 } from "lucide-react";

export const LoadingMessage = () => {
  return (
    <div className="flex items-start gap-2 animate-in fade-in-0">
      <div className="rounded-full bg-primary/10 p-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
      <div className="flex-1">
        <div className="prose prose-sm w-full break-words">
          <div className="flex gap-2 items-center text-muted-foreground">
            <span className="text-sm">AI is typing</span>
            <span className="animate-pulse">...</span>
          </div>
        </div>
      </div>
    </div>
  );
};