import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MedicalInfoFormProps {
  medicalConditions: string;
  medications: string;
  fertilityGoals: string;
  onMedicalConditionsChange: (value: string) => void;
  onMedicationsChange: (value: string) => void;
  onFertilityGoalsChange: (value: string) => void;
}

export const MedicalInfoForm = ({
  medicalConditions,
  medications,
  fertilityGoals,
  onMedicalConditionsChange,
  onMedicationsChange,
  onFertilityGoalsChange,
}: MedicalInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="medicalConditions">Medical Conditions (comma-separated)</Label>
        <Input
          id="medicalConditions"
          value={medicalConditions}
          onChange={(e) => onMedicalConditionsChange(e.target.value)}
          placeholder="PCOS, Endometriosis, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medications">Medications (comma-separated)</Label>
        <Input
          id="medications"
          value={medications}
          onChange={(e) => onMedicationsChange(e.target.value)}
          placeholder="Enter any medications you're taking"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fertilityGoals">Fertility Goals</Label>
        <Input
          id="fertilityGoals"
          value={fertilityGoals}
          onChange={(e) => onFertilityGoalsChange(e.target.value)}
          placeholder="Describe your fertility goals"
        />
      </div>
    </div>
  );
};