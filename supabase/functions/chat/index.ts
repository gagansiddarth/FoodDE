// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
// Provide a fallback type for linters/builders that don't inject Deno types
// deno-types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

Deno.serve(async (req) => {
  if (!GEMINI_API_KEY) return new Response('Missing GEMINI_API_KEY', { status: 500 })
  try {
    const { question, context } = await req.json()
    if (!question || typeof question !== 'string') return new Response(JSON.stringify({ error: 'Missing question' }), { status: 400 })
    
    const contextText = context ? `Context: ${JSON.stringify(context)}\n` : ''
    const fullPrompt = `You are a helpful nutrition expert and food safety consultant. Provide concise, actionable advice based on scientific evidence. Keep responses under 150 words and focus on practical recommendations.

${contextText}Question: ${question}

Please provide evidence-based advice that is:
- Practical and actionable
- Based on current nutrition science
- Specific to the user's question
- Helpful for making informed food choices`
    
    const requestBody = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    }
    
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    
    const data = await r.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not process your request.'
    
    return new Response(JSON.stringify({ content }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Chat failed', detail: String(e) }), { status: 500 })
  }
})

