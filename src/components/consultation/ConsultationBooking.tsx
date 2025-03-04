
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ConsultationBookingProps {
  expertId: string;
  expertName: string;
  consultationFee: number;
}

export const ConsultationBooking = ({
  expertId,
  expertName,
  consultationFee,
}: ConsultationBookingProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBooking = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date for the consultation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create consultation record
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          patient_id: user.id,
          expert_id: expertId,
          scheduled_for: selectedDate.toISOString(),
          consultation_fee: consultationFee,
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      // Send email notification
      const { error: notificationError } = await supabase
        .functions.invoke('send-consultation-notification', {
          body: {
            consultationId: consultation.id,
            expertId,
            patientId: user.id,
            scheduledFor: selectedDate,
          },
        });

      if (notificationError) throw notificationError;

      toast({
        title: "Success",
        description: `Consultation booked with ${expertName}`,
      });

      // Redirect to payment
      navigate(`/payment/${consultation.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Book Consultation</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Consultation Fee: ${consultationFee}
      </p>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="mb-4"
      />
      <Button
        onClick={handleBooking}
        disabled={!selectedDate || loading}
        className="w-full"
      >
        {loading ? "Booking..." : "Book Consultation"}
      </Button>
    </Card>
  );
};
