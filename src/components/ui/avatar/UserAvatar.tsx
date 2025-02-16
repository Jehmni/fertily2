import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useImageLoad } from "@/hooks/useImageLoad";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  fallback: string;
  className?: string;
}

export const UserAvatar = ({ src, fallback, className }: UserAvatarProps) => {
  const { loaded, error } = useImageLoad(src || undefined);

  return (
    <Avatar className={cn("bg-muted", className)}>
      {src && !error && <AvatarImage src={src} className={cn(!loaded && "hidden")} />}
      <AvatarFallback delayMs={loaded ? 0 : 600}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}; 