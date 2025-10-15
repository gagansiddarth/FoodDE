import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { supabase } from "@/shared/utils/supabase/client";
import { toast } from "@/shared/hooks/use-toast";
import { Shield, Zap } from "lucide-react";
import ThemeToggleAdvanced from "./ThemeToggleAdvanced";

const SiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="py-4 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <nav className="container flex items-center justify-between">
        <Link 
          to="/" 
          state={{ resetTab: true }}
          className="group flex items-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <Shield className="w-8 h-8 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <Zap className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
              FoodDE
            </span>
            <span className="text-xs text-muted-foreground -mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Food Debugger & Evaluator
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
            <Link to="/scan">Scan</Link>
          </Button>
          <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
            <Link to="/chat">Chat</Link>
          </Button>
          <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
            <Link to="/history">History</Link>
          </Button>
          <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
            <Link to="/saved">Saved</Link>
          </Button>
          <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
            <Link to="/community">Community</Link>
          </Button>
          <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
            <Link to="/how-it-works">How it works</Link>
          </Button>
          {isLoggedIn && (
            <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
              <Link to="/profile">Profile</Link>
            </Button>
          )}
          <ThemeToggleAdvanced />
          {isLoggedIn ? (
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                toast({ title: "Signed out" });
                navigate("/", { replace: true });
              }}
              className="transition-all duration-200 hover:scale-105"
            >
              Logout
            </Button>
          ) : (
            <Button variant="outline" asChild className="transition-all duration-200 hover:scale-105">
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;


