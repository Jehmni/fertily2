
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface PaymentFormProps {
  consultationId: string;
  amount: number;
}

export const PaymentForm = ({ consultationId, amount }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would integrate with your payment provider
      // For now, we'll simulate a successful payment
      const { error } = await supabase
        .from('consultations')
        .update({
          payment_status: 'completed',
          payment_intent_id: `sim_${Date.now()}`,
        })
        .eq('id', consultationId);

      if (error) throw error;

      // Record payment
      const { error: paymentError } = await supabase
        .from('consultation_payments')
        .insert({
          consultation_id: consultationId,
          amount,
          status: 'completed',
          payment_method: 'card',
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Success",
        description: "Payment processed successfully",
      });

      navigate('/consultations');
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
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <Label htmlFor="card-number">Card Number</Label>
          <Input
            id="card-number"
            placeholder="4242 4242 4242 4242"
            value={cardDetails.number}
            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="123"
              value={cardDetails.cvc}
              onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing..." : `Pay $${amount}`}
        </Button>
      </form>
    </Card>
  );
};
