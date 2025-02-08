
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IVFMedicalData, IVFPredictionService } from "@/services/IVFPredictionService";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";

export const IVFMedicalDataForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IVFMedicalData>({
    age: 0,
    bmi: 0,
    smoking_status: false,
    alcohol_consumption: "none",
    medical_history: {},
    amh_level: 0,
    fsh_level: 0,
    lh_level: 0,
    estradiol_level: 0,
    antral_follicle_count: 0,
    sperm_quality: {},
    previous_ivf_cycles: 0,
    previous_ivf_outcomes: {},
    uterine_conditions: [],
    embryo_quality: "unknown",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await IVFPredictionService.submitMedicalData(formData);
      toast({
        title: "Success",
        description: "Medical data submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit medical data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IVFMedicalData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          IVF Medical Data Form
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bmi">BMI</Label>
          <Input
            id="bmi"
            type="number"
            step="0.1"
            value={formData.bmi}
            onChange={(e) => handleInputChange("bmi", parseFloat(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smoking">Smoking Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="smoking"
              checked={formData.smoking_status}
              onCheckedChange={(checked) =>
                handleInputChange("smoking_status", checked)
              }
            />
            <span>{formData.smoking_status ? "Yes" : "No"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alcohol">Alcohol Consumption</Label>
          <Select
            value={formData.alcohol_consumption}
            onValueChange={(value) =>
              handleInputChange("alcohol_consumption", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select alcohol consumption" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="occasional">Occasional</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="frequent">Frequent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amh">AMH Level (ng/mL)</Label>
          <Input
            id="amh"
            type="number"
            step="0.1"
            value={formData.amh_level}
            onChange={(e) =>
              handleInputChange("amh_level", parseFloat(e.target.value))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fsh">FSH Level (mIU/mL)</Label>
          <Input
            id="fsh"
            type="number"
            step="0.1"
            value={formData.fsh_level}
            onChange={(e) =>
              handleInputChange("fsh_level", parseFloat(e.target.value))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previous_cycles">Previous IVF Cycles</Label>
          <Input
            id="previous_cycles"
            type="number"
            value={formData.previous_ivf_cycles}
            onChange={(e) =>
              handleInputChange("previous_ivf_cycles", parseInt(e.target.value))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="embryo_quality">Embryo Quality</Label>
          <Select
            value={formData.embryo_quality}
            onValueChange={(value) => handleInputChange("embryo_quality", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select embryo quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting
          </>
        ) : (
          "Submit Medical Data"
        )}
      </Button>
    </form>
  );
};
