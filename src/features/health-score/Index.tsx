import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Upload, Image as ImageIcon, MessageCircle, History as HistoryIcon, TriangleAlert, Shield, AlertTriangle, CheckCircle, Info, User, MapPin, Calendar, Loader2, Zap, Users, Bookmark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cleanIngredients } from "@/shared/utils/cleanIngredients";
import { runOCR } from "@/shared/utils/ocr";
import { analyzeIngredients, type AnalysisResult, scoreToHslParts } from "@/shared/utils/analyze";
import { detectAllergens, checkDietCompatibility } from "@/shared/utils/advancedAnalysis";
import { getRecentScans, saveScan, saveScanPermanently, type Scan } from "@/shared/utils/storage";
import { Seo } from "@/shared/components";
import { supabase } from "@/shared/utils/supabase/client";
import { toast } from "@/shared/hooks/use-toast";
import { 
  saveScanToSupabase,
  createScan,
  markScanSaved,
  addChatMessage,
  fetchChatHistory,
  fetchLatestScan,
} from "@/shared/utils/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import InlineChat from "@/features/chat/InlineChat";
import CameraCapture from "@/features/camera/CameraCapture";
import { OnboardingModal, LandingSlider, ScanProgress, Disclaimer } from "@/shared/components";
import CommunityFeed from "@/shared/components/CommunityFeed";
import AdvancedAnalysis from "@/shared/components/AdvancedAnalysis";
import ReactMarkdown from "react-markdown";

interface IndexProps {
  initialTab?: "home" | "scan" | "results" | "chat" | "history" | "community" | "saved";
}

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  location: string;
  profilePicture?: string;
}

const Index = ({
  initialTab = "home"
}: IndexProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Scan state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [lastAnalyzedText, setLastAnalyzedText] = useState<string>("");
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatResponse, setChatResponse] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; created_at: string; scan_id: string | null }>>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [scanMethod, setScanMethod] = useState<"camera" | "upload" | "text">("upload");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Scan progress state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState<'ocr' | 'analysis' | 'complete' | 'error'>('complete');
  const [scanError, setScanError] = useState<string>('');
  const [isScanInProgress, setIsScanInProgress] = useState(false);

  // Advanced analysis state
  const [detectedAllergens, setDetectedAllergens] = useState<any[]>([]);
  const [dietCompatibility, setDietCompatibility] = useState<any[]>([]);

  // History
  const recent = useMemo(() => getRecentScans(), []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Reset to home tab when navigating to root path
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('home');
    }
  }, [location.pathname, activeTab]);

  // Also reset to home when the component mounts on root path
  useEffect(() => {
    if (location.pathname === '/' && activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [location.pathname, activeTab]);

  // Reset scan progress when switching tabs
  useEffect(() => {
    if (activeTab !== 'scan') {
      setScanProgress(0);
      setScanStep('complete');
      setScanError('');
      setIsScanInProgress(false);
    }
  }, [activeTab]);

  // Cleanup function for intervals
  useEffect(() => {
    return () => {
      // Cleanup any running intervals when component unmounts
      setScanProgress(0);
      setScanStep('complete');
      setScanError('');
    };
  }, []);


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation with analysis data
  useEffect(() => {
    const stateData = location.state as { analysis?: AnalysisResult; resetTab?: boolean } | null;
    if (stateData?.analysis) {
      setAnalysis(stateData.analysis);
      setActiveTab('results');
    } else if (stateData?.resetTab) {
      setActiveTab('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Load and persist API key
  useEffect(() => {
    const stored = localStorage.getItem('foodde_gemini_key');
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (stored) {
      setApiKey(stored);
    } else if (envKey) {
      setApiKey(envKey);
    }
  }, []);
  useEffect(() => {
    if (apiKey) localStorage.setItem('foodde_gemini_key', apiKey);
  }, [apiKey]);

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${session.user.id}`);
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
      }
    };
    checkOnboarding();
  }, []);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab !== 'chat' || !isLoggedIn) return;
      setIsHistoryLoading(true);
      let effectiveId = scanId;
      if (!effectiveId) {
        const { row } = await fetchLatestScan();
        if (row?.id) {
          effectiveId = row.id as string;
          setScanId(effectiveId);
        }
      }
      const { rows } = await fetchChatHistory({ scan_id: effectiveId ?? undefined, limit: 100 });
      setChatHistory(rows as Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; created_at: string; scan_id: string | null }>);
      setIsHistoryLoading(false);
    };
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn]);

  // Auto-open camera/upload picker when method is selected
  useEffect(() => {
    if (activeTab !== 'scan') return;
    if (scanMethod === 'camera' && !imageFile) {
      // Prefer in-app camera overlay for capture flow
      setShowCamera(true);
    }
    if (scanMethod === 'upload' && !imageFile) {
      setTimeout(() => uploadInputRef.current?.click(), 50);
    }
  }, [scanMethod, activeTab, imageFile]);

  const onDrop = (file: File) => {
    setImageFile(file);
  };

  const handleRunOCR = async () => {
    if (!imageFile) return;
    setIsOcrRunning(true);
    try {
      const text = await runOCR(imageFile);
      setOcrText(text);
    } finally {
      setIsOcrRunning(false);
    }
  };

  const handleAnalyze = async () => {
    const text = ocrText.trim();
    if (!text) return;
    
    try {
      const res = await analyzeIngredients(text, apiKey);
      setAnalysis(res);
      
      // Perform advanced analysis
      const allergens = detectAllergens(text);
      const dietComp = checkDietCompatibility(text);
      setDetectedAllergens(allergens);
      setDietCompatibility(dietComp);
      
      // persist to history (24h auto)
      const scan: Scan = {
        scan_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: imageFile ? "image" : "text",
        image_path: null,
        raw_text: text,
        cleaned_ingredients: cleanIngredients(text),
        analysis: res,
        saved: false,
        user_notes: null
      };
      saveScan(scan);

      // If logged in, also create a server-side scan (unsaved by default) and remember id
      if (isLoggedIn) {
        const { id, error } = await createScan({
          source: imageFile ? 'image' : 'text',
          image_url: null,
          raw_text: text,
          cleaned_ingredients: cleanIngredients(text),
          analysis: res,
          saved: false,
        });
        if (!error && id) setScanId(id);
      }
      setActiveTab("results");
      // Remove navigation to /results since we're using tab switching
      // navigate("/results");
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Analysis Failed",
        description: `Failed to analyze ingredients: ${errorMessage}. Please check your API key and try again.`,
        variant: "destructive",
      });
    }
  };

  // Unified run: handles camera/upload OCR or direct text, then analysis
  const handleRetry = () => {
    setScanStep('ocr');
    setScanProgress(0);
    setScanError('');
    handleRunUnified();
  };

  const handleRunUnified = async () => {
    let textToAnalyze = "";
    
    // Set scan in progress
    setIsScanInProgress(true);
    
    // Reset scan progress
    setScanProgress(0);
    setScanStep('ocr');
    setScanError('');
    
    if (scanMethod === 'text') {
      textToAnalyze = textInput.trim();
      setScanProgress(30);
      setScanStep('analysis');
    } else {
      if (!imageFile) {
        // Prompt to pick image for selected method
        if (scanMethod === 'camera') cameraInputRef.current?.click();
        if (scanMethod === 'upload') uploadInputRef.current?.click();
        return;
      }
      
      setIsOcrRunning(true);
      setScanStep('ocr');
      
      try {
        // Simulate OCR progress with proper interval
        const progressInterval = setInterval(() => {
          setScanProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
        
        // Add timeout to OCR to prevent hanging
        const ocrPromise = runOCR(imageFile);       
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('OCR timeout - image processing took too long')), 30000)
        );
        
        const text = await Promise.race([ocrPromise, timeoutPromise]) as string;
        clearInterval(progressInterval);
        setScanProgress(100);
        setOcrText(text);
        textToAnalyze = text.trim();
        
        // Fallback: If OCR returns empty text, show error
        if (!textToAnalyze) {
          throw new Error('OCR failed to extract any text from the image. Please try with a clearer image.');
        }
        
        setScanProgress(30);
        setScanStep('analysis');
      } catch (error) {
        console.error('OCR failed:', error);
        setScanStep('error');
        setScanError('Failed to extract text from image. Please try again with a clearer image.');
        setIsScanInProgress(false);
        toast({
          title: "OCR Failed",
          description: "Failed to extract text from image. Please try again with a clearer image.",
          variant: "destructive",
        });
        return;
      } finally {
        setIsOcrRunning(false);
      }
    }
    
    if (!textToAnalyze) return;
    setLastAnalyzedText(textToAnalyze);
    setOcrText(textToAnalyze);
    
    // Simulate analysis progress with proper interval
    const analysisInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(analysisInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      await handleAnalyze();
      clearInterval(analysisInterval);
      setScanProgress(100);
      setScanStep('complete');
      setIsScanInProgress(false);
      // Automatically switch to results tab after successful analysis
      setActiveTab("results");
      // Remove navigation to /results since we're using tab switching
      // navigate("/results");
    } catch (error) {
      console.error('Analysis failed:', error);
      setScanStep('error');
      setScanError('Analysis failed. Please check your API key and try again.');
      setIsScanInProgress(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim() || !apiKey) return;
    setIsChatLoading(true);
    try {
      // Determine context for the chat
      let contextAnalysis: AnalysisResult | null = analysis;
      let effectiveScanId: string | null = scanId;
      if (isLoggedIn && (!contextAnalysis || !effectiveScanId)) {
        const { row } = await fetchLatestScan();
        if (row?.analysis) {
          contextAnalysis = row.analysis as AnalysisResult;
        }
        if (row?.id) {
          effectiveScanId = row.id as string;
          if (!scanId) setScanId(row.id as string);
        }
      }

      const systemContent = `You are a helpful nutrition expert and food safety consultant. Provide concise, actionable advice based on scientific evidence. Keep responses under 150 words and focus on practical recommendations.

Please provide evidence-based advice that is:
- Practical and actionable
- Based on current nutrition science
- Specific to the user's question
- Helpful for making informed food choices`;

      const userContent = contextAnalysis
        ? `Context: ${JSON.stringify({ health_score: contextAnalysis.health_score, flags: contextAnalysis.flags, summary: contextAnalysis.summary })}\nQuestion: ${chatMessage}`
        : `Question: ${chatMessage}`;

      // Persist user message if logged in
      if (isLoggedIn) {
        await addChatMessage({ role: 'user', content: chatMessage, scan_id: effectiveScanId ?? null });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemContent}\n\n${userContent}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content received from API');
      }

      setChatResponse(content);

      // Update in-UI history minimally
      setChatHistory(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: chatMessage, created_at: new Date().toISOString(), scan_id: effectiveScanId ?? null },
        { id: crypto.randomUUID(), role: 'assistant', content, created_at: new Date().toISOString(), scan_id: effectiveScanId ?? null },
      ]);

      // Persist assistant message if logged in
      if (isLoggedIn) {
        await addChatMessage({ role: 'assistant', content, scan_id: effectiveScanId ?? null });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setChatResponse(`Sorry, there was an error processing your request: ${errorMessage}. Please check your API key and try again.`);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Save profile to localStorage
        localStorage.setItem(`profile_${session.user.id}`, JSON.stringify(profile));
        // Mark onboarding as completed
        localStorage.setItem(`onboarding_completed_${session.user.id}`, 'true');
        
        setShowOnboarding(false);
        toast({
          title: "Welcome to FoodDE!",
          description: `Hi ${profile.name}, your profile has been set up successfully.`,
        });
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Error",
        description: "Failed to save profile information",
        variant: "destructive",
      });
    }
  };

  const HealthScoreBadge = ({
    score
  }: {
    score: number;
  }) => {
    const hslParts = scoreToHslParts(score);
    const getScoreLabel = (score: number) => {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "Good";
      if (score >= 40) return "Fair";
      if (score >= 20) return "Poor";
      return "Very Poor";
    };

    const getScoreIcon = (score: number) => {
      if (score >= 80) return <CheckCircle className="w-4 h-4" />;
      if (score >= 60) return <Shield className="w-4 h-4" />;
      if (score >= 40) return <Info className="w-4 h-4" />;
      return <AlertTriangle className="w-4 h-4" />;
    };

    return (
      <div 
        className="inline-flex items-center justify-center rounded-xl px-4 py-2 border transition-all duration-200 hover:scale-105" 
        style={{
          backgroundColor: `hsl(${hslParts} / 0.12)`,
          borderColor: `hsl(${hslParts} / 0.25)`,
          color: `hsl(${hslParts})`
        } as React.CSSProperties}
      >
        {getScoreIcon(score)}
        <span className="text-sm font-medium ml-2">FoodDE's Score</span>
        <span className="ml-2 text-xl font-semibold">{score}</span>
        <span className="ml-2 text-xs opacity-75">({getScoreLabel(score)})</span>
      </div>
    );
  };

  const HealthScoreGauge = ({
    score
  }: {
    score: number;
  }) => {
    const getScoreLabel = (score: number) => {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "Good";
      if (score >= 40) return "Fair";
      if (score >= 20) return "Poor";
      return "Very Poor";
    };

    const getScoreIcon = (score: number) => {
      if (score >= 80) return <CheckCircle className="w-6 h-6" />;
      if (score >= 60) return <Shield className="w-6 h-6" />;
      if (score >= 40) return <Info className="w-6 h-6" />;
      return <AlertTriangle className="w-6 h-6" />;
    };

    // Calculate gauge angle (0-180 degrees for semi-circle)
    const gaugeAngle = (score / 100) * 180;
    const rotation = gaugeAngle - 90; // Start from -90 degrees (left side)

    // Color zones for the gauge
    const getGaugeColor = (score: number) => {
      if (score >= 80) return "#22c55e"; // Green
      if (score >= 60) return "#84cc16"; // Lime
      if (score >= 40) return "#eab308"; // Yellow
      if (score >= 20) return "#f97316"; // Orange
      return "#ef4444"; // Red
    };

    const gaugeColor = getGaugeColor(score);

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl shadow-lg border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-card-foreground mb-2">FoodDE's Score</h2>
          <div className="flex items-center justify-center gap-3">
            {getScoreIcon(score)}
            <span className="text-4xl font-bold" style={{ color: gaugeColor }}>
              {score}
            </span>
            <span className="text-lg text-muted-foreground font-medium">
              ({getScoreLabel(score)})
            </span>
          </div>
        </div>

        {/* Gauge/Meter */}
        <div className="relative w-64 h-32 mb-6">
          {/* Gauge background */}
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="w-48 h-24 bg-muted rounded-t-full relative overflow-hidden">
              {/* Color zones */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-lime-500 to-green-500"></div>
              
              {/* Gauge pointer */}
              <div 
                className="absolute bottom-0 left-1/2 w-1 h-20 bg-foreground origin-bottom transition-all duration-1000 ease-out"
                style={{ 
                  transform: `translateX(-50%) rotate(${rotation}deg)`,
                  transformOrigin: 'bottom center'
                }}
              >
                {/* Pointer tip */}
                <div 
                  className="absolute -top-2 left-1/2 w-4 h-4 bg-foreground rounded-full transform -translate-x-1/2"
                  style={{ boxShadow: '0 0 8px hsl(var(--foreground) / 0.3)' }}
                ></div>
              </div>
              
              {/* Center circle */}
              <div className="absolute bottom-0 left-1/2 w-6 h-6 bg-card border-4 border-foreground rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
            </div>
          </div>
          
          {/* Score markers */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground font-medium">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Color legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Poor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Fair</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Excellent</span>
          </div>
        </div>
      </div>
    );
  };

  const QuickHealthAdvice = ({ analysis }: { analysis: AnalysisResult }) => {
    const harmfulCount = analysis.breakdown.filter(b => b.classification === 'Harmful').length;
    const moderateCount = analysis.breakdown.filter(b => b.classification === 'Moderately Harmful').length;
    
    return (
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Health Advice</h3>
            <div className="space-y-2">
              {analysis.health_advice?.map((advice, index) => (
                <p key={index} className="text-sm text-blue-800 dark:text-blue-200">• {advice}</p>
              ))}
            </div>
            <div className="flex gap-2 text-xs mt-3">
              {harmfulCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <TriangleAlert className="w-3 h-3 mr-1" />
                  {harmfulCount} harmful
                </Badge>
              )}
              {moderateCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {moderateCount} moderate
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <main>
      {/* Scan Progress Overlay */}
      <ScanProgress
        isRunning={isScanInProgress && (isOcrRunning || (scanStep === 'analysis' && scanProgress > 0 && scanProgress < 100) || (scanStep === 'ocr' && scanProgress > 0 && scanProgress < 100))}
        progress={scanProgress}
        currentStep={scanStep}
        errorMessage={scanError}
        onRetry={handleRetry}
      />
      
      {activeTab === "home" && (
        <section className="min-h-screen flex flex-col">
          <Seo 
            title="FoodDE – AI Food Label Analyzer" 
            description="Scan ingredients, get FoodDE's score, and flag harmful additives with FoodDE." 
            canonical="https://foodde.app/" 
          />
          {/* Global header is rendered in App.tsx; local header removed to avoid duplication */}
          
          <section className="flex-1 container grid md:grid-cols-2 gap-10 items-center surface-hero rounded-2xl p-8">
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4 animate-slide-in animate-stagger-1">
                <Shield className="w-8 h-8 text-primary animate-pulse-slow" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
                  KNOW WHAT YOU EAT
                </h1>
              </div>
              <p className="text-muted-foreground mb-6 text-lg animate-fade-in animate-stagger-2">
                AI-powered ingredient analysis that helps you make informed decisions about packaged foods. 
                Get instant FoodDE's scores, flag harmful additives, and receive personalized advice.
              </p>
              <div className="flex gap-3 animate-bounce-in animate-stagger-3">
                <Button variant="hero" size="xl" onClick={() => {
                  setActiveTab('scan');
                  navigate('/scan');
                }} className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Upload className="mr-2" /> Start Scan
                </Button>
                <Button variant="outline" size="xl" onClick={() => navigate('/community')} className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Users className="mr-2" /> Join Community
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {/* Enhanced Sliding UI - Keeping the original card structure but with slides */}
              <LandingSlider 
                onScanClick={() => {
                  setActiveTab('scan');
                  // Don't navigate, just change the tab locally
                }}
                onCommunityClick={() => {
                  navigate('/community');
                }}
              />
            </div>
          </section>
          {/* Extended landing sections */}
          <section className="container py-16">
            <h2 className="text-3xl font-bold mb-6 animate-fade-in">Why choose FoodDE?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 card-elevated bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800 animate-slide-in animate-stagger-1">
                <h3 className="font-semibold mb-2">Context-aware AI</h3>
                <p className="text-sm text-indigo-800 dark:text-indigo-200">Understands ingredients in context, not just keywords.</p>
              </Card>
              <Card className="p-6 card-elevated bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20 border-sky-200 dark:border-sky-800 animate-slide-in animate-stagger-2">
                <h3 className="font-semibold mb-2">Fast & Private</h3>
                <p className="text-sm text-sky-800 dark:text-sky-200">Runs quickly with client-side processing and secure APIs.</p>
              </Card>
              <Card className="p-6 card-elevated bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800 animate-slide-in animate-stagger-3">
                <h3 className="font-semibold mb-2">Actionable Tips</h3>
                <p className="text-sm text-rose-800 dark:text-rose-200">Clear advice and safer alternatives you can use today.</p>
              </Card>
            </div>
          </section>

          <section className="container py-16">
            <h2 className="text-3xl font-bold mb-6 animate-fade-in">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 card-elevated animate-slide-in animate-stagger-1">
                <h3 className="font-semibold mb-2">1. Scan</h3>
                <p className="text-sm text-muted-foreground">Use your camera, upload an image, or paste text.</p>
              </Card>
              <Card className="p-6 card-elevated animate-slide-in animate-stagger-2">
                <h3 className="font-semibold mb-2">2. Analyze</h3>
                <p className="text-sm text-muted-foreground">Our AI classifies ingredients and computes FoodDE's score.</p>
              </Card>
              <Card className="p-6 card-elevated animate-slide-in animate-stagger-3">
                <h3 className="font-semibold mb-2">3. Decide</h3>
                <p className="text-sm text-muted-foreground">See flags, advice, and chat with the AI nutrition expert.</p>
              </Card>
            </div>
          </section>

          <section className="container py-16">
            <h2 className="text-3xl font-bold mb-6 animate-fade-in">What users say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 card-elevated animate-slide-in animate-stagger-1">
                <p className="text-sm">"Made shopping so much easier. The flags are spot-on."</p>
                <p className="mt-3 text-xs text-muted-foreground">— Aarav, Parent</p>
              </Card>
              <Card className="p-6 card-elevated animate-slide-in animate-stagger-2">
                <p className="text-sm">"Quickly identifies hidden additives I always miss."</p>
                <p className="mt-3 text-xs text-muted-foreground">— Priya, Health Coach</p>
              </Card>
              <Card className="p-6 card-elevated animate-slide-in animate-stagger-3">
                <p className="text-sm">"Love the concise advice and the chat feature."</p>
                <p className="mt-3 text-xs text-muted-foreground">— Rajesh, Fitness Trainer</p>
              </Card>
            </div>
          </section>

          <section className="container py-16">
            <h2 className="text-3xl font-bold mb-6 animate-fade-in text-foreground">Personalized Experience</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="animate-slide-in animate-stagger-1">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Your Health Profile</h3>
                <p className="text-muted-foreground mb-6">
                  Create your personalized profile to get tailored health recommendations based on your age, 
                  location, and preferences. Track your progress and save your favorite scans.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">Personalized health insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">Region-specific recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">Age-appropriate advice</span>
                  </div>
                </div>
              </div>
              <div className="animate-slide-in animate-stagger-2">
                <Card className="p-6 card-elevated bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2 text-foreground">Complete Your Profile</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get started with just a few quick questions to personalize your experience.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/auth')}
                      className="animate-pulse-slow"
                    >
                      Get Started
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          <section className="container py-16">
            <div className="p-8 card-elevated rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-green-200 dark:border-green-800 text-center animate-fade-in">
              <h2 className="text-3xl font-bold mb-3">Ready to know what you eat?</h2>
              <p className="text-muted-foreground mb-6">Scan any label and get instant, actionable health insights.</p>
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => { setActiveTab('scan'); navigate('/scan'); }}
                className="animate-bounce-in transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Start Scanning
              </Button>
            </div>
          </section>

          {/* Comprehensive Disclaimer Section */}
          <section className="container py-16">
            <Disclaimer variant="full" />
          </section>
        </section>
      )}


      
      {activeTab === "scan" && (
        <section className="min-h-screen container py-10">
          <Seo 
            title="Scan Ingredients – FoodDE" 
            description="Upload a label or paste ingredients to analyze health impact." 
            canonical="https://foodde.app/scan" 
          />
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Scan Your Ingredients</h1>
              <p className="text-muted-foreground text-lg">
                Upload a food label image or paste ingredients to get instant health insights
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6 card-elevated">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Scan Method</h3>
                </div>
                <div className="grid gap-4">
                  <Select value={scanMethod} onValueChange={(v) => setScanMethod(v as "camera" | "upload" | "text")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camera">Use Camera</SelectItem>
                      <SelectItem value="upload">Choose Image File</SelectItem>
                      <SelectItem value="text">Paste Text</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Hidden inputs for camera/upload */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files && onDrop(e.target.files[0])}
                  />
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && onDrop(e.target.files[0])}
                  />
                  {scanMethod !== 'text' && (
                    <div className="rounded-xl border p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-3">{imageFile ? `Selected: ${imageFile.name}` : 'No image selected yet'}</p>
                      <div className="flex gap-3 justify-center">
                        {scanMethod === 'camera' && (
                          <Button variant="outline" onClick={() => setShowCamera(true)}>Open Camera</Button>
                        )}
                        {scanMethod === 'upload' && (
                          <Button variant="outline" onClick={() => uploadInputRef.current?.click()}>Choose File</Button>
                        )}
                        {imageFile && (
                          <>
                            <Button variant="default" onClick={() => setImageFile(null)}>Retake</Button>
                            <Button variant="hero" onClick={handleRunUnified} disabled={isOcrRunning}>Use Photo</Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {scanMethod === 'text' && (
                    <Textarea
                      rows={10}
                      placeholder="e.g. Wheat flour, Sugar, Palm Oil, E102, Salt, Natural flavors"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                  )}
                  
                  {/* Disclaimer for scan input */}
                  <Disclaimer variant="compact" className="mb-4" />
                  
                  <Button 
                    variant="hero" 
                    onClick={handleRunUnified} 
                    disabled={isOcrRunning || (!imageFile && !textInput.trim())}
                    className="w-full"
                  >
                      {isOcrRunning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Run Analysis
                        </>
                      )}
                    </Button>
                </div>
              </Card>
              <Card className="p-6 card-elevated bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-semibold mb-2">How It Works</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">Our AI references public health research to contextualize ingredients instead of static dictionaries.</p>
              </Card>
              <Card className="p-6 card-elevated bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                <h3 className="text-xl font-semibold mb-2">Smart Flags</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">Harmful and moderate ingredients are clearly flagged with reasons and severity.</p>
              </Card>
              <Card className="p-6 card-elevated bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-semibold mb-2">Quick Advice</h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">Get concise recommendations and alternatives tailored to your scan.</p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {showCamera && scanMethod === 'camera' && (
        <CameraCapture
          onClose={() => setShowCamera(false)}
          onUsePhoto={(blob) => {
            const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
            setImageFile(file);
            setShowCamera(false);
          }}
        />
      )}

      {activeTab === "results" && analysis && (
        <section className="min-h-screen container py-10 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <Seo 
            title="Results – FoodDE" 
            description="See FoodDE's score, flags, and quick advice for your scan." 
            canonical="https://foodde.app/results" 
          />
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">Analysis Results</h1>
            
            {/* FoodDE's Score Gauge - Centered and Prominent */}
            <div className="flex justify-center mb-8">
              <HealthScoreGauge score={analysis.health_score} />
            </div>
            
            <Card className="p-8 mb-6 bg-card border-2 border-blue-200 dark:border-blue-800 shadow-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-4 text-card-foreground">Analysis Summary</h2>
                <p className="text-muted-foreground text-lg">{analysis.summary}</p>
              </div>
              
              <QuickHealthAdvice analysis={analysis} />
            </Card>

            {/* Disclaimer for scan results */}
            <Disclaimer variant="detailed" className="mb-6" />

            {/* Inline chat on results */}
            <InlineChat context={{ health_score: analysis.health_score, flags: analysis.flags, summary: analysis.summary }} />

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-2 border-orange-200 dark:border-orange-800 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                  <TriangleAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Ingredient Analysis
                </h2>
                <div className="space-y-3">
                  {analysis.breakdown.map(b => (
                    <div key={b.ingredient} className="flex items-center justify-between border-2 border-border rounded-lg p-3 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors bg-muted/50">
                      <div className="flex-1">
                        <span className="font-medium text-card-foreground">{b.ingredient}</span>
                        <p className="text-xs text-muted-foreground mt-1">{b.reason}</p>
                      </div>
                      <Badge 
                        variant={b.classification === 'Healthy' ? 'secondary' : b.classification === 'Moderately Harmful' ? 'default' : 'destructive'}
                        className="ml-2"
                      >
                        {b.classification}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-card border-2 border-red-200 dark:border-red-800 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Flagged Ingredients
                </h2>
                <div className="space-y-3">
                  {Array.isArray(analysis.flags) && analysis.flags.length > 0 ? (
                    analysis.flags.map(f => (
                      <div key={f} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                        <TriangleAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="font-medium text-red-800 dark:text-red-200">{f}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-800 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-800 dark:text-green-200 font-medium">No concerning ingredients detected</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Advanced Ingredient Analysis */}
            <AdvancedAnalysis 
              ingredients={ocrText.trim() || textInput.trim()}
              allergens={detectedAllergens}
              dietCompatibility={dietCompatibility}
            />

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-center mb-4 text-card-foreground">Save Your Analysis</h3>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/chat', { state: { analysis } })} variant="outline" className="border-2 border-border hover:border-border/80">
                  <MessageCircle className="mr-2" />
                  Chat about these ingredients
                </Button>
                <Button
                  variant="premium"
                  size="lg"
                  className="min-w-[160px] shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                  onClick={async () => {
                  if (!isLoggedIn) {
                    toast({ title: 'Login required', description: 'Sign in to save scans.' });
                    navigate('/auth');
                    return;
                  }
                  // If we already created a scan for this analysis, just mark saved
                  if (scanId) {
                    const { error } = await markScanSaved(scanId);
                    if (error) {
                      toast({ title: 'Save failed', description: error.message });
                    } else {
                      toast({ title: 'Saved', description: 'Scan saved to your account.' });
                      navigate('/saved');
                    }
                    return;
                  }
                  // Otherwise insert directly as saved now
                  const text = ocrText.trim();
                  const scan: Scan = {
                    scan_id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    source: imageFile ? 'image' : 'text',
                    image_path: null,
                    raw_text: text || analysis.summary,
                    cleaned_ingredients: cleanIngredients(text || ''),
                    analysis,
                    saved: true,
                    user_notes: null,
                  };
                  const { error, id } = await saveScanToSupabase(scan);
                  if (error) {
                    toast({ title: 'Save failed', description: error.message });
                  } else {
                    if (id) setScanId(id);
                    toast({ title: 'Saved', description: 'Scan saved to your account.' });
                    navigate('/saved');
                  }
                }}
              >
                <Bookmark className="mr-2" />
                Save Scan
              </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "history" && (
        <section className="min-h-screen container py-10">
          <Seo 
            title="History – FoodDE" 
            description="Review your recent and saved scans." 
            canonical="https://foodde.app/history" 
          />
          <h1 className="text-4xl font-bold mb-6">Recent Scans (last 24h)</h1>
          <div className="grid lg:grid-cols-2 gap-6">
            {Array.isArray(recent) && recent.length > 0 ? (
              recent.map(scan => (
                <Card key={scan.scan_id} className="p-5 card-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{new Date(scan.timestamp).toLocaleString()}</p>
                      <p className="font-medium mt-1 line-clamp-1">{scan.raw_text}</p>
                    </div>
                    <HealthScoreBadge score={scan.analysis.health_score} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(scan.analysis.flags) && scan.analysis.flags.slice(0, 4).map(f => (
                      <Badge key={f} variant="destructive">
                        <TriangleAlert className="w-3 h-3 mr-1" />
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAnalysis(scan.analysis);
                        setActiveTab("results");
                        navigate("/results");
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setAnalysis(scan.analysis);
                        setActiveTab("chat");
                        navigate("/chat");
                      }}
                    >
                      Ask AI
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent scans yet. Start by analyzing some ingredients!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "saved" && (
        <section className="min-h-screen container py-10">
          <Seo 
            title="Saved Scans – FoodDE" 
            description="View and manage your saved ingredient scans." 
            canonical="https://foodde.app/saved" 
          />
          <h1 className="text-4xl font-bold mb-6">Saved Scans</h1>
          <div className="grid lg:grid-cols-2 gap-6">
            {Array.isArray(recent) && recent.filter(scan => scan.saved).length > 0 ? (
              recent.filter(scan => scan.saved).map(scan => (
                <Card key={scan.scan_id} className="p-5 card-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{new Date(scan.timestamp).toLocaleString()}</p>
                      <p className="font-medium mt-1 line-clamp-1">{scan.raw_text}</p>
                    </div>
                    <HealthScoreBadge score={scan.analysis.health_score} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(scan.analysis.flags) && scan.analysis.flags.slice(0, 4).map(f => (
                      <Badge key={f} variant="destructive">
                        <TriangleAlert className="w-3 h-3 mr-1" />
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAnalysis(scan.analysis);
                        setActiveTab("results");
                        navigate("/results");
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setAnalysis(scan.analysis);
                        setActiveTab("chat");
                        navigate("/chat");
                      }}
                    >
                      Ask AI
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No saved scans yet. Save your first scan to see it here!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "chat" && (
        <section className="min-h-screen container py-10">
          <Seo 
            title="AI Chat – FoodDE" 
            description="Ask follow-ups about your latest scan." 
            canonical="https://foodde.app/chat" 
          />
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">AI Nutrition Expert</h1>
            
            <Card className="p-6 card-elevated mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Ask About Ingredients</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered nutrition advice about your food scans
              </p>
            </Card>

            <Card className="p-6 card-elevated">
              <div className="space-y-4">
                  {/* Minimal chat history */}
                  <div className="space-y-2 max-h-80 overflow-auto pr-1">
                    {isHistoryLoading && (
                      <p className="text-xs text-muted-foreground">Loading history…</p>
                    )}
                    {chatHistory.map(m => (
                      <div key={m.id} className={`p-3 rounded-lg text-sm ${m.role === 'assistant' ? 'bg-muted/60' : 'bg-primary/10'}`}>
                        <span className="font-medium mr-2">{m.role === 'assistant' ? 'AI' : 'You'}:</span>
                        {m.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <span>{m.content}</span>
                        )}
                      </div>
                    ))}
                    {chatResponse && !chatHistory.some(h => h.content === chatResponse) && (
                      <div className="p-3 rounded-lg text-sm bg-muted/60">
                        <span className="font-medium mr-2">AI:</span>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {chatResponse}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Input
                      placeholder="Ask about ingredients, health impacts, or alternatives..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleChat();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleChat} 
                      disabled={!chatMessage.trim() || isChatLoading}
                    >
                      {isChatLoading ? 'Thinking...' : 'Ask'}
                    </Button>
                  </div>
                  
                  {chatResponse && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {chatResponse}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          </div>
        </section>
      )}

      {activeTab === "community" && (
        <section className="min-h-screen container py-10">
          <Seo 
            title="Community – FoodDE" 
            description="Share scan results, discuss products, and connect with health-conscious users." 
            canonical="https://foodde.app/community" 
          />
          <CommunityFeed />
        </section>
      )}

      <OnboardingModal
         isOpen={showOnboarding}
         onComplete={handleOnboardingComplete}
       />
       
       {/* Floating Action Button */}
       <button
         onClick={() => {
           setActiveTab('scan');
           navigate('/scan');
         }}
         className="fab"
         aria-label="Quick scan"
       >
         <Upload className="w-6 h-6" />
       </button>
    </main>
  );
};

export default Index;