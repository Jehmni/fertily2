import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FertilityInsightCardProps {
  title: string;
  content: string;
}

export const FertilityInsightCard = ({ title, content }: FertilityInsightCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{content}</p>
      </CardContent>
    </Card>
  );
};