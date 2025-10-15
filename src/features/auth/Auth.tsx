import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { Seo } from "@/shared/components";
import { supabase } from "@/shared/utils/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/hooks/use-toast";
import { upsertUserProfile } from "@/shared/utils/profile";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(() => {
    // Load saved email from localStorage
    return localStorage.getItem('foodde_email') || "";
  });
  const [password, setPassword] = useState(() => {
    // Load saved password from localStorage (optional - for convenience)
    return localStorage.getItem('foodde_password') || "";
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if user wants to remember details
    return localStorage.getItem('foodde_remember') === 'true';
  });

  const createUserProfile = async (userId: string, email: string) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Create new profile
        await upsertUserProfile(userId, email, {});
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Don't show error to user as this is not critical
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Create profile if user just signed up or profile doesn't exist
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await createUserProfile(session.user.id, session.user.email || '');
        }
        navigate("/", { replace: true });
      }
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await createUserProfile(session.user.id, session.user.email || '');
        navigate("/", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: "Missing information", description: "Please fill in all fields." });
      return;
    }
    
    // Save user details if remember me is checked
    if (rememberMe) {
      localStorage.setItem('foodde_email', email);
      localStorage.setItem('foodde_password', password);
      localStorage.setItem('foodde_remember', 'true');
    } else {
      // Clear saved details if remember me is unchecked
      localStorage.removeItem('foodde_email');
      localStorage.removeItem('foodde_password');
      localStorage.setItem('foodde_remember', 'false');
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message });
    } else {
      toast({ title: "Welcome back" });
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      toast({ title: "Missing information", description: "Please fill in all fields." });
      return;
    }
    
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters." });
      return;
    }
    
    // Save user details if remember me is checked
    if (rememberMe) {
      localStorage.setItem('foodde_email', email);
      localStorage.setItem('foodde_password', password);
      localStorage.setItem('foodde_remember', 'true');
    } else {
      // Clear saved details if remember me is unchecked
      localStorage.removeItem('foodde_email');
      localStorage.removeItem('foodde_password');
      localStorage.setItem('foodde_remember', 'false');
    }
    
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message });
    } else {
      toast({ title: "Check your email", description: "Confirm your address to finish signup." });
    }
  };

  return (
    <main className="min-h-screen container py-10">
      <Seo 
        title="Sign in – FoodDE" 
        description="Login or create an account to save scans." 
        canonical="https://foodde.app/auth" 
      />
      
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">FoodDE</h1>
          </div>
          <p className="text-muted-foreground">
            {mode === "login" 
              ? "Sign in to save your ingredient analyses" 
              : "Create an account to start saving your scans"
            }
          </p>
        </div>

        <Card className="p-8 card-elevated">
          <div className="mb-6">
            <div className="flex gap-2 mb-6">
              <Button 
                variant={mode === "login" ? "default" : "outline"} 
                onClick={() => setMode("login")}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button 
                variant={mode === "signup" ? "default" : "outline"} 
                onClick={() => setMode("signup")}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input 
                type="email" 
                placeholder="your@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
              />
            </div>
            
            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-700">
                Remember my email and password
              </label>
            </div>

            {mode === "login" ? (
              <Button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            ) : (
              <Button 
                onClick={handleSignup} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === "login" 
              ? "Don't have an account? " 
              : "Already have an account? "
            }
            <button 
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
