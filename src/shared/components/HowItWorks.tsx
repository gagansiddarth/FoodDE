import React from "react";
import { Seo } from "@/shared/components";
import { Card } from "@/shared/components/ui/card";
import { Upload, Brain, ShieldCheck } from "lucide-react";

const HowItWorks: React.FC = () => {
  return (
    <main className="min-h-screen">
      <Seo title="How it works – FoodDE" description="Learn how FoodDE analyzes ingredients and computes FoodDE's score." canonical="https://foodde.app/how-it-works" />
      <section className="container py-10 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">How it works</h1>
        <p className="text-muted-foreground mb-8">FoodDE scans labels with OCR, cleans ingredient text, and analyzes each ingredient with AI to produce an easy-to-understand FoodDE's score and flags.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 card-elevated">
            <Upload className="text-primary mb-2" />
            <h3 className="font-semibold mb-2">Scan or Paste</h3>
            <p className="text-sm text-muted-foreground">Upload a label photo or paste an ingredient list.</p>
          </Card>
          <Card className="p-6 card-elevated">
            <Brain className="text-primary mb-2" />
            <h3 className="font-semibold mb-2">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">We classify ingredients and compute a 0–100 FoodDE's score.</p>
          </Card>
          <Card className="p-6 card-elevated">
            <ShieldCheck className="text-primary mb-2" />
            <h3 className="font-semibold mb-2">Actionable Tips</h3>
            <p className="text-sm text-muted-foreground">Get concise advice and chat for deeper questions.</p>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default HowItWorks;


