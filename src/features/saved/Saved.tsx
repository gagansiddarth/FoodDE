import React, { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TriangleAlert, CheckCircle, Shield, Info, AlertTriangle, BookmarkX, Trash2 } from "lucide-react";
import { Seo } from "@/shared/components";
import { supabase } from "@/shared/utils/supabase/client";
import { useNavigate } from "react-router-dom";
import { scoreToHslParts } from "@/shared/utils/analyze";
import { toast } from "@/shared/hooks/use-toast";

import type { AnalysisResult } from "@/shared/utils/analyze";

interface SavedScanRow {
  id: string;
  created_at: string;
  raw_text: string;
  analysis: AnalysisResult;
}

const Saved = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SavedScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const handleUnsaveScan = async (scanId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from("scans")
        .update({ saved: false })
        .eq("id", scanId)
        .eq("user_id", session.user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to unsave scan",
          variant: "destructive",
        });
      } else {
        // Remove from the list
        setRows(prev => prev.filter(scan => scan.id !== scanId));
        toast({
          title: "Scan unsaved",
          description: "Scan has been removed from your saved list",
        });
      }
    } catch (error) {
      console.error('Error unsaving scan:', error);
      toast({
        title: "Error",
        description: "Failed to unsave scan",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!confirm("Are you sure you want to permanently delete this scan?")) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from("scans")
        .delete()
        .eq("id", scanId)
        .eq("user_id", session.user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete scan",
          variant: "destructive",
        });
      } else {
        // Remove from the list
        setRows(prev => prev.filter(scan => scan.id !== scanId));
        toast({
          title: "Scan deleted",
          description: "Scan has been permanently deleted",
        });
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: "Error",
        description: "Failed to delete scan",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth", { replace: true });
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from("scans")
        .select("id, created_at, raw_text, analysis, source, image_url")
        .eq("user_id", session.user.id)
        .eq("saved", true)
        .order("created_at", { ascending: false });
      
      if (!error && data) setRows(data as unknown as SavedScanRow[]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const HealthScoreBadge = ({ score }: { score: number }) => {
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

  if (loading) {
    return (
      <main className="min-h-screen container py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your saved scans...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen container py-10">
      <Seo 
        title="Saved Scans – FoodDE" 
        description="Your saved ingredient analyses." 
        canonical="https://foodde.app/saved" 
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Saved Scans</h1>
            <p className="text-muted-foreground">Your saved ingredient analyses and health insights</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No saved scans yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by analyzing some ingredients and save the results for future reference.
            </p>
            <Button onClick={() => navigate('/scan')}>
              Start Your First Scan
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {rows.map((scan) => (
              <Card key={scan.id} className="p-6 card-elevated hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(scan.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {scan.raw_text.length > 60 
                        ? scan.raw_text.substring(0, 60) + '...' 
                        : scan.raw_text
                      }
                    </h3>
                  </div>
                  <HealthScoreBadge score={scan.analysis.health_score} />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {scan.analysis.flags.slice(0, 3).map(f => (
                      <Badge key={f} variant="destructive" className="text-xs">
                        <TriangleAlert className="w-3 h-3 mr-1" />
                        {f}
                      </Badge>
                    ))}
                    {scan.analysis.flags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{scan.analysis.flags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {scan.analysis.health_advice && scan.analysis.health_advice.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-1">Quick Advice:</p>
                      <p className="text-xs text-blue-700 line-clamp-2">
                        {scan.analysis.health_advice[0]}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Navigate to results with this scan data
                        navigate('/results', { state: { analysis: scan.analysis } });
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/chat')}
                    >
                      Ask AI
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleUnsaveScan(scan.id)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <BookmarkX className="w-4 h-4 mr-1" />
                      Unsave
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteScan(scan.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Saved;
