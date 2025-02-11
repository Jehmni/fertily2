
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const onboardingSlides = [
  {
    title: "Welcome to Your Fertility Journey! 👋",
    description: "Track your fertility cycle with personalized insights and support.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Personal AI Assistant",
    description: "Chat with our AI assistant for 24/7 support and guidance.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Join Our Community",
    description: "Connect with others and share experiences in a supportive environment.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    if (hasCompletedOnboarding === "true") {
      setShowOnboarding(false);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    };

    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }

    if (showSignUpForm) {
      if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (showSignUpForm) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        });
        if (error) throw error;
        toast({
          title: "✨ Account Created!",
          description: "Please check your email to verify your account.",
        });
        localStorage.setItem("hasCompletedOnboarding", "true");
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

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // On last slide, complete onboarding
      setShowOnboarding(false);
      setShowSignUpForm(true);
      localStorage.setItem("hasCompletedOnboarding", "true");
    }
  };

  const toggleAuthMode = () => {
    if (showSignUpForm) {
      // Switch to login
      setShowSignUpForm(false);
      setShowOnboarding(false);
    } else {
      // Switch to signup flow
      setShowOnboarding(true);
      setCurrentSlide(0);
    }
    // Reset form
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-4">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <DialogTitle className="sr-only">Onboarding</DialogTitle>
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
                  onClick={handleNext}
                  className="min-w-[100px]"
                >
                  {currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-lg animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-primary">
          {showSignUpForm ? "Create Account" : "Welcome Back"}
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          {showSignUpForm && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-red-500" : ""}
              required
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {showSignUpForm && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
                required
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{showSignUpForm ? "Creating Account..." : "Signing In..."}</span>
              </div>
            ) : (
              <span>{showSignUpForm ? "Create Account" : "Sign In"}</span>
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-sm text-primary hover:underline"
          >
            {showSignUpForm 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
