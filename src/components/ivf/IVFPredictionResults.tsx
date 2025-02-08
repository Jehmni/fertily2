
import { Card } from "@/components/ui/card";
import { IVFPrediction } from "@/services/IVFPredictionService";
import { ChartLine, CheckCircle, Info } from "lucide-react";

interface IVFPredictionResultsProps {
  prediction: IVFPrediction;
}

export const IVFPredictionResults = ({ prediction }: IVFPredictionResultsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <ChartLine className="w-6 h-6" />
        IVF Success Prediction
      </h2>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Success Probability</span>
            <span className="text-2xl font-bold text-primary">
              {prediction.success_probability}%
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Info className="w-5 h-5" />
              Key Factors
            </h3>
            <ul className="space-y-2">
              {Object.entries(prediction.key_factors).map(([factor, impact]) => (
                <li key={factor} className="flex items-start gap-2">
                  <span className="text-gray-600">{factor}:</span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {prediction.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-600">
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
