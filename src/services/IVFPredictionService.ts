
import { supabase } from "@/lib/supabase";

export interface IVFMedicalData {
  age: number;
  bmi: number;
  smoking_status: boolean;
  alcohol_consumption: string;
  medical_history: Record<string, any>;
  amh_level: number;
  fsh_level: number;
  lh_level: number;
  estradiol_level: number;
  antral_follicle_count: number;
  sperm_quality: Record<string, any>;
  previous_ivf_cycles: number;
  previous_ivf_outcomes: Record<string, any>;
  uterine_conditions: string[];
  embryo_quality: string;
}

export interface IVFPrediction {
  id: string;
  user_id: string;
  medical_data_id: string;
  success_probability: number;
  key_factors: Record<string, any>;
  recommendations: string[];
  created_at: string;
}

export const IVFPredictionService = {
  async submitMedicalData(data: IVFMedicalData) {
    const { data: medicalData, error: medicalError } = await supabase
      .from('ivf_medical_data')
      .insert(data)
      .select()
      .single();

    if (medicalError) {
      throw new Error('Failed to submit medical data');
    }

    const { data: prediction, error: predictionError } = await supabase.functions.invoke('ivf-predict', {
      body: { medicalData },
    });

    if (predictionError) {
      throw new Error('Failed to generate prediction');
    }

    return prediction;
  },

  async getPredictionHistory() {
    const { data, error } = await supabase
      .from('ivf_predictions')
      .select(`
        *,
        ivf_medical_data (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch prediction history');
    }

    return data;
  },

  async getMedicalData() {
    const { data, error } = await supabase
      .from('ivf_medical_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
};
