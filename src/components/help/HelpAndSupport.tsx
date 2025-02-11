
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { HelpCircle, Send, Loader2 } from "lucide-react";

export const HelpAndSupport = () => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    subject: "",
    message: "",
  });

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically send the feedback to your backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Thank you for your feedback!",
        description: "We'll review your message and get back to you if needed.",
      });
      
      setFeedback({ subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </CardTitle>
          <CardDescription>
            Find answers to common questions or send us your feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I track my cycle?</AccordionTrigger>
              <AccordionContent>
                You can track your cycle by navigating to the home page and using the calendar feature.
                Simply click on the date your period starts and we'll help you track your fertility window.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does the AI assistant work?</AccordionTrigger>
              <AccordionContent>
                Our AI assistant uses advanced natural language processing to understand your questions
                and provide personalized responses based on your fertility data and medical knowledge.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Yes! We take data security seriously. All your data is encrypted and stored securely.
                You can manage your data retention settings and export your data at any time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <h3 className="text-lg font-semibold">Send Feedback</h3>
            <div className="space-y-2">
              <Input
                placeholder="Subject"
                value={feedback.subject}
                onChange={(e) => setFeedback(f => ({ ...f, subject: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Your message"
                value={feedback.message}
                onChange={(e) => setFeedback(f => ({ ...f, message: e.target.value }))}
                required
                className="min-h-[100px]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Send Feedback</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
