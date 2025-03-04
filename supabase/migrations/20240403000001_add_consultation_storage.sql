
-- Create a storage bucket for embryo images
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, avif_autodetection)
  VALUES ('embryo_images', 'embryo_images', false, false);
EXCEPTION
  WHEN unique_violation THEN
    NULL;
END $$;

-- Storage bucket policies
CREATE POLICY "Embryo images accessible to involved parties"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'embryo_images' AND (
      -- Check if user is the patient or expert associated with the image
      EXISTS (
        SELECT 1 FROM embryo_data
        WHERE storage.objects.name = embryo_data.image_url
        AND (
          embryo_data.patient_id = auth.uid() OR
          embryo_data.expert_id = auth.uid()
        )
      )
    )
  );

-- Add payment fields to consultations table
ALTER TABLE consultations
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN payment_intent_id TEXT,
ADD COLUMN consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Add notification preferences to profiles table
ALTER TABLE profiles
ADD COLUMN email_notifications BOOLEAN DEFAULT true,
ADD COLUMN consultation_reminders BOOLEAN DEFAULT true;

-- Create consultation_payments table for payment history
CREATE TABLE consultation_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payments
ALTER TABLE consultation_payments ENABLE ROW LEVEL SECURITY;

-- Payment records visible to involved parties
CREATE POLICY "Payment records visible to involved parties"
  ON consultation_payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_payments.consultation_id
      AND (
        consultations.patient_id = auth.uid() OR
        consultations.expert_id = auth.uid()
      )
    )
  );
