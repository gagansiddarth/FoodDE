export type Classification = 'Healthy' | 'Moderately Harmful' | 'Harmful';

export type BreakdownItem = {
  ingredient: string;
  classification: Classification;
  severity: number; // 0..5
  reason: string;
};

export type AnalysisResult = {
  health_score: number; // 0..100
  summary: string;
  breakdown: BreakdownItem[];
  flags: string[];
  health_advice: string[];
};

const harmfulENumbers = new Set(['e102','e110','e122','e124','e129','e133','e150','e151','e154','e155','e180']);
const moderateList = new Set(['sugar','palm oil','salt','glucose syrup','fructose','corn syrup','high fructose corn syrup','partially hydrogenated','trans fat']);
const healthyList = new Set(['whole grain','organic','natural','vitamin','mineral','fiber','protein','omega-3','antioxidant']);

export function scoreToHslParts(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = Math.round((clamped / 100) * 120); // 0:red -> 120:green
  return `${hue} 75% 45%`;
}

function ruleBasedAnalyze(ingredients: string[]): AnalysisResult {
  const breakdown = ingredients.map<BreakdownItem>((ing) => {
    const lowerIng = ing.toLowerCase();
    
    // Check for harmful ingredients
    if (harmfulENumbers.has(lowerIng)) {
      return { 
        ingredient: ing, 
        classification: 'Harmful', 
        severity: 4, 
        reason: 'Artificial additive with potential adverse health effects' 
      };
    }
    
    // Check for E-numbers (harmful)
    if (/^e\d{3}$/i.test(ing)) {
      return { 
        ingredient: ing, 
        classification: 'Harmful', 
        severity: 3, 
        reason: 'E-number additive; potential health risks' 
      };
    }
    
    // Check for moderate ingredients
    if (moderateList.has(lowerIng)) {
      const reason = lowerIng === 'palm oil' ? 'High in saturated fat' : 
                    lowerIng === 'sugar' ? 'Added sugar content' : 
                    lowerIng === 'salt' ? 'High sodium content' :
                    lowerIng === 'glucose syrup' ? 'High glycemic index' :
                    lowerIng === 'fructose' ? 'Added fructose' :
                    lowerIng === 'corn syrup' ? 'Processed sweetener' :
                    lowerIng === 'high fructose corn syrup' ? 'Highly processed sweetener' :
                    lowerIng === 'partially hydrogenated' ? 'Contains trans fats' :
                    'Consume in moderation';
      return { 
        ingredient: ing, 
        classification: 'Moderately Harmful', 
        severity: 2, 
        reason 
      };
    }
    
    // Check for healthy ingredients
    if (healthyList.has(lowerIng)) {
      return { 
        ingredient: ing, 
        classification: 'Healthy', 
        severity: 0, 
        reason: 'Beneficial nutritional component' 
      };
    }
    
    // Default classification
    return { 
      ingredient: ing, 
      classification: 'Healthy', 
      severity: 0, 
      reason: 'Common food ingredient' 
    };
  });

  const base = 100;
  const totalPenalty = breakdown.reduce((acc, b) => acc + b.severity * 6, 0);
  const health_score = Math.max(0, Math.min(100, base - totalPenalty));
  
  const flags = breakdown.filter(b => b.classification !== 'Healthy').map(b => b.ingredient);
  
  const summary = flags.length
    ? `Contains ${flags.join(', ')}; review before frequent consumption.`
    : 'No concerning additives detected.';

  // Generate health advice based on analysis
  const health_advice = generateHealthAdvice(breakdown, health_score);

  return { health_score, summary, breakdown, flags, health_advice };
}

function generateHealthAdvice(breakdown: BreakdownItem[], score: number): string[] {
  const advice: string[] = [];
  const harmfulCount = breakdown.filter(b => b.classification === 'Harmful').length;
  const moderateCount = breakdown.filter(b => b.classification === 'Moderately Harmful').length;

  if (score >= 80) {
    advice.push("This product appears to be a healthy choice. Continue enjoying it as part of a balanced diet.");
  } else if (score >= 60) {
    advice.push("This product is generally acceptable. Consider it as an occasional treat rather than a daily staple.");
    if (moderateCount > 0) {
      advice.push("Look for alternatives with fewer processed ingredients.");
    }
  } else if (score >= 40) {
    advice.push("This product has some concerning ingredients. Look for alternatives with fewer additives.");
    if (harmfulCount > 0) {
      advice.push("Consider products without artificial additives and preservatives.");
    }
  } else {
    advice.push("This product contains multiple concerning ingredients. Consider healthier alternatives.");
    advice.push("Limit consumption and look for products with simpler ingredient lists.");
  }

  if (harmfulCount > 0) {
    advice.push("Avoid products with artificial colors, flavors, and preservatives when possible.");
  }

  if (moderateCount > 2) {
    advice.push("High levels of processed ingredients detected. Choose whole food alternatives.");
  }

  return advice;
}

export async function analyzeIngredients(text: string, apiKey?: string): Promise<AnalysisResult> {
  const ingredients = text.split(',').map(s => s.trim()).filter(Boolean);

  // Get API key from environment if not provided
  if (!apiKey) {
    apiKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('No Gemini API key provided. Please set VITE_GEMINI_API_KEY environment variable.');
    }
  }

  // Try server-side analysis first (more secure)
  try {
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
    if (supabaseUrl) {
      const r = await fetch(`${supabaseUrl}/functions/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ingredients.join(', ') })
      });
      if (r.ok) {
        const parsed = await r.json() as AnalysisResult;
        // Validate the response
        if (parsed && typeof parsed.health_score === 'number' && Array.isArray(parsed.breakdown)) {
          return parsed;
        }
      }
    }
  } catch (error) {
    console.debug('Supabase analysis failed, falling back to client-side:', error);
  }

  // Client-side AI analysis
  try {
    const comprehensivePrompt = `You are an expert nutritionist and food safety analyst. Analyze the following ingredient list comprehensively.

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

Ingredients to analyze: "${ingredients.join(', ')}"`;

    const requestBody = {
      contents: [{
        parts: [{
          text: comprehensivePrompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    };
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from API');
    }

    // Clean and parse the response
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(cleanContent) as AnalysisResult;

    // Validate the parsed response
    if (!parsed || typeof parsed.health_score !== 'number' || !Array.isArray(parsed.breakdown)) {
      throw new Error('Invalid response format from AI');
    }

    // Ensure all required fields exist
    if (!parsed.summary) parsed.summary = 'Analysis completed';
    if (!parsed.flags) parsed.flags = [];
    if (!parsed.health_advice) parsed.health_advice = generateHealthAdvice(parsed.breakdown, parsed.health_score);

    return parsed;
  } catch (e) {
    console.error('AI analysis failed:', e);
    throw new Error(`Analysis failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}
