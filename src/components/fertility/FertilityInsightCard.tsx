
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FertilityInsightCardProps {
  title: string;
  content: string;
  icon?: LucideIcon;
  className?: string;
}

export const FertilityInsightCard = ({ 
  title, 
  content,
  icon: Icon,
  className = ""
}: FertilityInsightCardProps) => {
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center gap-2 p-4">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-lg font-semibold text-primary">{content}</p>
      </CardContent>
    </Card>
  );
};
