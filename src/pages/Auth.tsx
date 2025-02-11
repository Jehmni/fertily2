
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Loader2, Info } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const onboardingSlides = [
  {
    title: "Welcome to Your Fertility Journey! 👋",
    description: "Track your fertility cycle with personalized insights and support.",
    image: "/photo-1649972904349-6e44c42644a7",
  },
  {
    title: "Personal AI Assistant",
    description: "Chat with our AI assistant for 24/7 support and guidance.",
    image: "/photo-1581091226825-a6a2a5aee158",
  },
  {
    title: "Join Our Community",
    description: "Connect with others and share experiences in a supportive environment.",
    image: "/photo-1519389950473-47ba0277781c",
  },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle onboarding visibility based on sign up state
  useEffect(() => {
    setShowOnboarding(isSignUp);
  }, [isSignUp]);

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }

    if (isSignUp && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "✨ Account Created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "👋 Welcome back!",
          description: "Successfully signed in.",
        });
        navigate("/");
      }
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

  const handleNextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-4">
      {showOnboarding ? (
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <div className="relative">
              <img 
                src={onboardingSlides[currentSlide].image}
                alt="Onboarding"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">
                {onboardingSlides[currentSlide].title}
              </h2>
              <p className="text-muted-foreground">
                {onboardingSlides[currentSlide].description}
              </p>
              <div className="flex justify-between items-center pt-4">
                <div className="flex gap-2">
                  {onboardingSlides.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <Button 
                  onClick={handleNextSlide}
                  className="min-w-[100px]"
                >
                  {currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Card className="w-full max-w-md p-8 space-y-6 shadow-lg animate-fadeIn">
          <h1 className="text-3xl font-bold text-center text-primary">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter a valid email address</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                required
                className={`bg-white/50 transition-all duration-200 hover:bg-white/70 focus:bg-white
                  ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 animate-fade-in">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Password must be at least 6 characters long</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                required
                className={`bg-white/50 transition-all duration-200 hover:bg-white/70 focus:bg-white
                  ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 animate-fade-in">
                  {errors.password}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-200" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                </div>
              ) : (
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({ email: "", password: "" });
                setCurrentSlide(0);
              }}
              className="text-sm text-primary hover:underline transition-all duration-200"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Auth;
