
export const Header = () => {
  return (
    <div className="text-center mb-8 animate-fadeIn">
      <div className="flex items-center justify-center gap-4 mb-2 transition-all duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/27ff8345-8e52-4baf-a8f5-d267b1b7c37f.png" 
          alt="Fertily Logo" 
          className="w-16 h-16 rounded-full shadow-lg"
        />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Fertily
        </h1>
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-primary/80 mb-4">
        Your Personal Fertility Assistant
      </h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
        Get personalized insights and support on your fertility journey
      </p>
    </div>
  );
};
