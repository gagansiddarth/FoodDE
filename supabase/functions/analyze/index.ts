// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

interface BreakdownItem {
  ingredient: string
  classification: 'Healthy' | 'Moderately Harmful' | 'Harmful'
  severity: number
  reason: string
}

interface AnalysisResult {
  health_score: number
  summary: string
  breakdown: BreakdownItem[]
  flags: string[]
  health_advice: string[]
}

function postProcess(parsed: Record<string, unknown>): AnalysisResult {
  const breakdown: BreakdownItem[] = Array.isArray(parsed.breakdown) ? parsed.breakdown : []
  const penalty = breakdown.reduce((acc, b) => acc + (Number(b.severity) || 0) * 6, 0)
  const health_score = Math.max(0, Math.min(100, 100 - penalty))
  const flags = breakdown.filter(b => b.classification !== 'Healthy').map(b => b.ingredient)
  const summary = (parsed.summary as string) || (flags.length ? `Contains ${flags.join(', ')}; review before frequent consumption.` : 'No concerning additives detected.')
  const health_advice: string[] = Array.isArray(parsed.health_advice) ? parsed.health_advice : []
  return { health_score, summary, breakdown, flags, health_advice }
}

Deno.serve(async (req) => {
  if (!GEMINI_API_KEY) return new Response('Missing GEMINI_API_KEY', { status: 500 })
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400 })

    const prompt = `You are an expert nutritionist and food safety analyst. Analyze the following ingredient list comprehensively.

IMPORTANT GUIDELINES:
- Salt is generally safe in moderate amounts and should be classified as "Healthy" with severity 0-1
- Sugar in small amounts is acceptable, classify as "Moderately Harmful" with severity 1-2
- Artificial colors, preservatives, and synthetic additives are "Harmful" with severity 3-5
- Natural ingredients like vitamins, minerals, whole grains are "Healthy" with severity 0
- Processed ingredients like high fructose corn syrup, partially hydrogenated oils are "Harmful" with severity 3-4
- Common food ingredients like flour, water, natural flavors are "Healthy" with severity 0

Analyze each ingredient individually and return a JSON object with this exact structure:
{
  "health_score": number (0-100),
  "summary": "Brief summary of the analysis",
  "breakdown": [
    {
      "ingredient": "exact ingredient name",
      "classification": "Healthy" | "Moderately Harmful" | "Harmful",
      "severity": number (0-5),
      "reason": "Detailed explanation for the classification"
    }
  ],
  "flags": ["list of concerning ingredients"],
  "health_advice": ["actionable advice strings"]
}

Ingredients to analyze: "${text}"`

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a concise food-safety analyst. Return only valid JSON matching the schema described. ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
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
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
    
    // Clean the response to ensure it's valid JSON
    let cleanContent = content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '')
    }
    
    const parsed = JSON.parse(cleanContent)
    const result = postProcess(parsed)
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Analyze failed', detail: String(e) }), { status: 500 })
  }
})

