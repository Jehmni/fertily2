import { ChatWindow } from "@/components/ChatWindow";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white p-4">
      <div className="max-w-4xl mx-auto text-center mb-8 animate-fadeIn">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Your Personal Fertility Assistant
        </h1>
        <p className="text-lg text-gray-600">
          Get personalized insights and support on your fertility journey
        </p>
      </div>
      <ChatWindow />
    </div>
  );
};

export default Index;