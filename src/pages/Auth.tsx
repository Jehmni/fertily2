import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

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
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [cycleLength, setCycleLength] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>();
  const [fertilityGoals, setFertilityGoals] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [medications, setMedications] = useState("");
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
    cycleLength: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    if (hasCompletedOnboarding === "true") {
      setShowOnboarding(false);
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          navigate("/");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      cycleLength: "",
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
      if (cycleLength && (isNaN(Number(cycleLength)) || Number(cycleLength) < 20 || Number(cycleLength) > 40)) {
        newErrors.cycleLength = "Cycle length must be between 20 and 40 days";
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
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
            emailRedirectTo: window.location.origin
          }
        });
        
        if (signUpError) throw signUpError;

        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: firstName,
              last_name: lastName,
              date_of_birth: dateOfBirth?.toISOString(),
              cycle_length: cycleLength ? parseInt(cycleLength) : null,
              last_period_date: lastPeriodDate?.toISOString(),
              fertility_goals: fertilityGoals,
              medical_conditions: medicalConditions.split(',').map(c => c.trim()).filter(Boolean),
              medications: medications.split(',').map(m => m.trim()).filter(Boolean),
            })
            .eq('id', signUpData.user.id);

          if (profileError) throw profileError;

          toast({
            title: "✨ Account Created!",
            description: "Please check your email to verify your account.",
          });
          localStorage.setItem("hasCompletedOnboarding", "true");
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;

        if (signInData.user) {
          toast({
            title: "👋 Welcome back!",
            description: "Successfully signed in.",
          });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
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
      setShowOnboarding(false);
      setShowSignUpForm(true);
      localStorage.setItem("hasCompletedOnboarding", "true");
    }
  };

  const toggleAuthMode = () => {
    if (showSignUpForm) {
      setShowSignUpForm(false);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
      setCurrentSlide(0);
    }
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setDateOfBirth(undefined);
    setCycleLength("");
    setLastPeriodDate(undefined);
    setFertilityGoals("");
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      cycleLength: "",
    });
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <div className="flex justify-center p-4">
              <img 
                src="/lovable-uploads/27ff8345-8e52-4baf-a8f5-d267b1b7c37f.png"
                alt="Fertily Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            <DialogTitle className="sr-only">Onboarding</DialogTitle>
            <DialogDescription className="sr-only">
              Welcome to your fertility journey. Follow the steps to get started.
            </DialogDescription>
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
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <img 
          src="/lovable-uploads/27ff8345-8e52-4baf-a8f5-d267b1b7c37f.png"
          alt="Fertily Logo"
          className="w-32 h-32 object-contain"
        />
      </div>
      <Card className="w-full max-w-md p-8 space-y-6 shadow-lg animate-fadeIn bg-white/95 backdrop-blur-sm">
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

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={setDateOfBirth}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter any medical conditions, separated by commas</p>
                        <p>Example: PCOS, Endometriosis</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <Input
                  id="medicalConditions"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g., PCOS, Endometriosis"
                />
              </div>

              <div className="space-y-2">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="medications">Medications</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter any medications you're taking, separated by commas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <Input
                  id="medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="Enter medications, separated by commas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleLength">Average Cycle Length (days)</Label>
                <Input
                  id="cycleLength"
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  min="20"
                  max="40"
                  placeholder="e.g., 28"
                  className={errors.cycleLength ? "border-red-500" : ""}
                />
                {errors.cycleLength && (
                  <p className="text-sm text-red-500">{errors.cycleLength}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastPeriodDate">Last Period Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !lastPeriodDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {lastPeriodDate ? format(lastPeriodDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={lastPeriodDate}
                      onSelect={setLastPeriodDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fertilityGoals">Fertility Goals</Label>
                <Input
                  id="fertilityGoals"
                  value={fertilityGoals}
                  onChange={(e) => setFertilityGoals(e.target.value)}
                  placeholder="e.g., Trying to conceive, tracking cycle, etc."
                />
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
