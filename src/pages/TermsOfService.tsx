
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <ScrollArea className="h-[600px] rounded-md border p-6">
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using this fertility tracking application, you agree to be bound by these Terms of Service
                and all applicable laws and regulations.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Medical Disclaimer</h2>
              <p className="text-muted-foreground">
                The information provided by this application is for general informational purposes only and is not intended
                as a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
              <p className="text-muted-foreground">
                Users are responsible for maintaining the confidentiality of their account credentials and for all activities
                that occur under their account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Usage</h2>
              <p className="text-muted-foreground">
                We collect and process personal data as described in our Privacy Policy. By using the application, you
                consent to such processing and warrant that all data provided is accurate.
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TermsOfService;
