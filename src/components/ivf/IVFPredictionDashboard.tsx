
import { useState } from "react";
import { IVFMedicalDataForm } from "./IVFMedicalDataForm";
import { IVFPredictionResults } from "./IVFPredictionResults";
import { IVFPredictionHistory } from "./IVFPredictionHistory";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IVFPrediction } from "@/services/IVFPredictionService";

export const IVFPredictionDashboard = () => {
  const [currentPrediction, setCurrentPrediction] = useState<IVFPrediction | null>(
    null
  );

  return (
    <Card className="p-6">
      <Tabs defaultValue="form" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Medical Data Form</TabsTrigger>
          <TabsTrigger value="results" disabled={!currentPrediction}>
            Prediction Results
          </TabsTrigger>
          <TabsTrigger value="history">Prediction History</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <IVFMedicalDataForm />
        </TabsContent>

        <TabsContent value="results">
          {currentPrediction && <IVFPredictionResults prediction={currentPrediction} />}
        </TabsContent>

        <TabsContent value="history">
          <IVFPredictionHistory />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
