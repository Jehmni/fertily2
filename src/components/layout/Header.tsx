
import { Stethoscope } from "lucide-react";

export const Header = () => {
  return (
    <div className="text-center mb-8 animate-fadeIn">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Stethoscope className="w-12 h-12 text-primary" />
        <h1 className="text-5xl font-bold text-primary">
          Fertily
        </h1>
      </div>
      <h2 className="text-3xl font-semibold text-primary/80 mb-4">
        Your Personal Fertility Assistant
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Get personalized insights and support on your fertility journey
      </p>
    </div>
  );
};
