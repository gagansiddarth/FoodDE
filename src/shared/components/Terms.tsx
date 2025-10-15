import React from "react";
import { Seo } from "@/shared/components";

const Terms: React.FC = () => {
  return (
    <main className="min-h-screen container py-10 max-w-3xl">
      <Seo title="Terms of Service – FoodDE" description="Terms of Service for FoodDE." canonical="https://foodde.app/terms" />
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground">FoodDE provides informational analysis of ingredients and is not a substitute for professional medical advice. Use at your own discretion.</p>
    </main>
  );
};

export default Terms;


