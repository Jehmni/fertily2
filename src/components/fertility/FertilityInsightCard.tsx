
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
      <CardHeader className="flex flex-row items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-primary">{content}</p>
      </CardContent>
    </Card>
  );
};
