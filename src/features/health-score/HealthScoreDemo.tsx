import React from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { TriangleAlert, CheckCircle, Shield, Info, AlertTriangle } from "lucide-react";
import { scoreToHslParts } from "@/shared/utils/analyze";

interface HealthScoreDemoProps {
  className?: string;
}

const HealthScoreDemo: React.FC<HealthScoreDemoProps> = ({ className }) => {
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

  const demoScans = [
    {
      name: "Organic Granola Bar",
      score: 85,
      flags: ["Natural flavors", "Cane sugar"],
      classification: "Excellent"
    },
    {
      name: "Processed Cereal",
      score: 45,
      flags: ["E102", "High fructose corn syrup", "Artificial colors"],
      classification: "Fair"
    },
    {
      name: "Energy Drink",
      score: 25,
      flags: ["E150", "E133", "Caffeine", "Artificial sweeteners"],
      classification: "Poor"
    }
  ];

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">FoodDE's Score Examples</h3>
      <div className="grid gap-4">
        {demoScans.map((scan, index) => (
          <Card key={index} className="p-4 card-elevated">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">{scan.name}</h4>
                <p className="text-sm text-muted-foreground">{scan.classification}</p>
              </div>
              <HealthScoreBadge score={scan.score} />
            </div>
            <div className="flex flex-wrap gap-2">
              {scan.flags.map((flag, flagIndex) => (
                <Badge 
                  key={flagIndex} 
                  variant="destructive" 
                  className="text-xs"
                >
                  <TriangleAlert className="w-3 h-3 mr-1" />
                  {flag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HealthScoreDemo;
