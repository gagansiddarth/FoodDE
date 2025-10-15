import React from "react";
import { Seo } from "@/shared/components";
import { Card } from "@/shared/components/ui/card";

const Help: React.FC = () => {
  return (
    <main className="min-h-screen container py-10 max-w-4xl">
      <Seo title="Help – FoodDE" description="Help and FAQs for FoodDE." canonical="https://foodde.app/help" />
      <h1 className="text-4xl font-bold mb-6">Help & FAQs</h1>
      <div className="grid gap-4">
        <Card className="p-5 card-elevated">
          <h3 className="font-semibold mb-2">Why do I see no harmful flags?</h3>
          <p className="text-sm text-muted-foreground">Not all ingredients are harmful. Try scanning multiple products, or enable AI mode for deeper analysis.</p>
        </Card>
        <Card className="p-5 card-elevated">
          <h3 className="font-semibold mb-2">Is my data private?</h3>
          <p className="text-sm text-muted-foreground">Your data is protected under Row-Level Security in Supabase. Only you can access your scans and chat history.</p>
        </Card>
      </div>
    </main>
  );
};

export default Help;


