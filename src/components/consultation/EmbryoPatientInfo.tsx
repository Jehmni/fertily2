
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EmbryoPatientInfoProps {
  patientAge: string;
  previousIvfAttempts: string;
  ivfSuccessHistory: string;
  underlyingConditions: string;
  onPatientAgeChange: (value: string) => void;
  onPreviousIvfAttemptsChange: (value: string) => void;
  onIvfSuccessHistoryChange: (value: string) => void;
  onUnderlyingConditionsChange: (value: string) => void;
}

export const EmbryoPatientInfo = ({
  patientAge,
  previousIvfAttempts,
  ivfSuccessHistory,
  underlyingConditions,
  onPatientAgeChange,
  onPreviousIvfAttemptsChange,
  onIvfSuccessHistoryChange,
  onUnderlyingConditionsChange,
}: EmbryoPatientInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Patient Information (Optional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientAge">Age of Mother</Label>
          <Input
            id="patientAge"
            type="number"
            value={patientAge}
            onChange={(e) => onPatientAgeChange(e.target.value)}
            placeholder="Enter age"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="previousIvfAttempts">Previous IVF Attempts</Label>
          <Input
            id="previousIvfAttempts"
            type="number"
            value={previousIvfAttempts}
            onChange={(e) => onPreviousIvfAttemptsChange(e.target.value)}
            placeholder="Number of cycles"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ivfSuccessHistory">IVF Success History</Label>
          <Textarea
            id="ivfSuccessHistory"
            value={ivfSuccessHistory}
            onChange={(e) => onIvfSuccessHistoryChange(e.target.value)}
            placeholder="Details of previous IVF cycles"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="underlyingConditions">Underlying Conditions</Label>
          <Textarea
            id="underlyingConditions"
            value={underlyingConditions}
            onChange={(e) => onUnderlyingConditionsChange(e.target.value)}
            placeholder="e.g., PCOS, endometriosis (comma-separated)"
          />
        </div>
      </div>
    </div>
  );
};
