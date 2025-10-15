import React, { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle } from "lucide-react";

export interface InlineChatProps {
  context?: { health_score: number; flags: string[]; summary: string } | null;
}

const InlineChat: React.FC<InlineChatProps> = ({ context }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "";
      const r = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context })
      });
      const data = await r.json();
      setAnswer(data.content || '');
    } catch {
      setAnswer('Sorry, something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 card-elevated">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Ask AI about this scan</h3>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ask about ingredients, safety, or alternatives..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ask(); } }}
        />
        <Button onClick={ask} disabled={!question.trim() || loading}>{loading ? 'Thinking…' : 'Ask'}</Button>
      </div>
      {answer && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">{answer}</p>
        </div>
      )}
    </Card>
  );
};

export default InlineChat;


