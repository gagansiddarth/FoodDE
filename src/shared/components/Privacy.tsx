import React from "react";
import { Seo } from "@/shared/components";

const Privacy: React.FC = () => {
  return (
    <main className="min-h-screen container py-10 max-w-3xl">
      <Seo title="Privacy Policy – FoodDE" description="Privacy policy for FoodDE." canonical="https://foodde.app/privacy" />
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">We value your privacy. Ingredient analyses and chat history are stored under your account and protected by RLS in Supabase. For production, sensitive data is never stored server-side without your consent.</p>
      <p className="text-muted-foreground">In this demo, some processing may occur in the browser for speed. Refer to the repository README for deployment guidance and security recommendations.</p>
    </main>
  );
};

export default Privacy;


