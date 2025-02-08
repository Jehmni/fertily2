
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { IVFPrediction, IVFPredictionService } from "@/services/IVFPredictionService";
import { format } from "date-fns";
import { History, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const IVFPredictionHistory = () => {
  const [predictions, setPredictions] = useState<IVFPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const history = await IVFPredictionService.getPredictionHistory();
        setPredictions(history);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch prediction history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <History className="w-6 h-6" />
        Prediction History
      </h2>

      <div className="space-y-4">
        {predictions.length === 0 ? (
          <p className="text-center text-gray-500">No predictions found</p>
        ) : (
          predictions.map((prediction) => (
            <Card key={prediction.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {format(new Date(prediction.created_at), "PPP")}
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {prediction.success_probability}% Success Rate
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Factors</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(prediction.key_factors).map(
                        ([factor, impact]) => (
                          <li key={factor}>
                            <span className="text-gray-600">{factor}:</span>{" "}
                            {impact}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="text-sm space-y-1">
                      {prediction.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-gray-600">
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
