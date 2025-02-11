
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <ScrollArea className="h-[600px] rounded-md border p-6">
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Data Collection and Usage</h2>
              <p className="text-muted-foreground">
                We collect personal information that you voluntarily provide to us when using our fertility tracking
                services. This includes health data, menstrual cycle information, and other fertility-related data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Protection</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to ensure a level of security appropriate
                to the risk, including encryption of sensitive data and regular security assessments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
              <p className="text-muted-foreground">
                You can customize your data retention preferences in your account settings. By default, we retain your
                data for 365 days, after which it is automatically deleted unless specified otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, correct, or delete your personal data. You can manage these preferences
                in your account settings or contact our support team for assistance.
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
