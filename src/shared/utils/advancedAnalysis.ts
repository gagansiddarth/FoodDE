// Advanced Ingredient Analysis Utilities

export interface AllergenInfo {
  name: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  commonNames: string[];
}

export interface DietCompatibility {
  diet: string;
  isCompatible: boolean;
  confidence: number; // 0-100
  reasons: string[];
  restrictions: string[];
}

// Common allergens with their variations and severity
export const ALLERGENS: Record<string, AllergenInfo> = {
  nuts: {
    name: 'Tree Nuts',
    severity: 'high',
    description: 'Can cause severe allergic reactions including anaphylaxis',
    commonNames: ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', 'brazil nut', 'macadamia', 'pine nut', 'chestnut']
  },
  peanuts: {
    name: 'Peanuts',
    severity: 'high',
    description: 'Legume that can cause severe allergic reactions',
    commonNames: ['peanut', 'groundnut', 'arachis', 'monkey nut', 'goober pea']
  },
  gluten: {
    name: 'Gluten',
    severity: 'medium',
    description: 'Protein found in wheat, barley, and rye',
    commonNames: ['wheat', 'barley', 'rye', 'triticale', 'spelt', 'kamut', 'durum', 'semolina', 'bulgur', 'couscous', 'seitan']
  },
  soy: {
    name: 'Soy',
    severity: 'medium',
    description: 'Legume that can cause allergic reactions',
    commonNames: ['soy', 'soya', 'soybean', 'edamame', 'tofu', 'tempeh', 'miso', 'soy sauce', 'soy lecithin', 'soy protein']
  },
  dairy: {
    name: 'Dairy',
    severity: 'medium',
    description: 'Milk and milk products',
    commonNames: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'whey', 'casein', 'lactose', 'ghee', 'curd', 'paneer']
  },
  eggs: {
    name: 'Eggs',
    severity: 'medium',
    description: 'Chicken eggs and egg products',
    commonNames: ['egg', 'albumin', 'ovalbumin', 'lysozyme', 'lecithin', 'mayonnaise', 'marshmallow']
  },
  shellfish: {
    name: 'Shellfish',
    severity: 'high',
    description: 'Crustaceans and mollusks',
    commonNames: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'oyster', 'clam', 'mussel', 'scallop', 'squid', 'octopus']
  },
  fish: {
    name: 'Fish',
    severity: 'high',
    description: 'Various fish species',
    commonNames: ['tuna', 'salmon', 'cod', 'mackerel', 'sardine', 'anchovy', 'bass', 'trout', 'halibut', 'snapper']
  },
  sesame: {
    name: 'Sesame',
    severity: 'medium',
    description: 'Sesame seeds and oil',
    commonNames: ['sesame', 'sesamum', 'tahini', 'sesame oil', 'gingelly', 'til']
  },
  sulfites: {
    name: 'Sulfites',
    severity: 'low',
    description: 'Preservatives that can cause reactions in sensitive individuals',
    commonNames: ['sulfite', 'sulphite', 'sulfur dioxide', 'sodium sulfite', 'potassium sulfite', 'calcium sulfite']
  }
};

// Diet definitions and restrictions
export const DIETS: Record<string, { name: string; description: string; restrictions: string[]; keywords: string[] }> = {
  vegan: {
    name: 'Vegan',
    description: 'No animal products or by-products',
    restrictions: ['meat', 'dairy', 'eggs', 'honey', 'gelatin', 'casein', 'whey', 'lactose'],
    keywords: ['plant-based', 'vegan', 'no animal', 'dairy-free', 'egg-free']
  },
  vegetarian: {
    name: 'Vegetarian',
    description: 'No meat but may include dairy and eggs',
    restrictions: ['meat', 'fish', 'poultry', 'gelatin'],
    keywords: ['vegetarian', 'no meat', 'plant-based']
  },
  keto: {
    name: 'Keto',
    description: 'Low-carb, high-fat diet',
    restrictions: ['sugar', 'starch', 'grains', 'high-carb vegetables'],
    keywords: ['keto', 'low-carb', 'high-fat', 'ketogenic', 'sugar-free']
  },
  paleo: {
    name: 'Paleo',
    description: 'Based on foods presumed to be available to Paleolithic humans',
    restrictions: ['grains', 'legumes', 'dairy', 'processed foods', 'refined sugar'],
    keywords: ['paleo', 'caveman', 'primal', 'grain-free', 'legume-free']
  },
  halal: {
    name: 'Halal',
    description: 'Permissible according to Islamic law',
    restrictions: ['pork', 'alcohol', 'gelatin from non-halal sources'],
    keywords: ['halal', 'permissible', 'islamic', 'no pork', 'no alcohol']
  },
  kosher: {
    name: 'Kosher',
    description: 'Foods that conform to Jewish dietary law',
    restrictions: ['pork', 'shellfish', 'mixing meat and dairy'],
    keywords: ['kosher', 'jewish', 'no pork', 'no shellfish']
  },
  diabetic: {
    name: 'Diabetic-Friendly',
    description: 'Low glycemic index and sugar content',
    restrictions: ['high-sugar', 'refined carbohydrates', 'high glycemic foods'],
    keywords: ['diabetic', 'low-sugar', 'low-glycemic', 'sugar-free', 'diabetes-friendly']
  },
  glutenFree: {
    name: 'Gluten-Free',
    description: 'No gluten-containing grains',
    restrictions: ['wheat', 'barley', 'rye', 'gluten'],
    keywords: ['gluten-free', 'no gluten', 'celiac-friendly', 'wheat-free']
  },
  dairyFree: {
    name: 'Dairy-Free',
    description: 'No milk or milk products',
    restrictions: ['milk', 'dairy', 'lactose', 'casein', 'whey'],
    keywords: ['dairy-free', 'lactose-free', 'no dairy', 'milk-free']
  },
  lowSodium: {
    name: 'Low-Sodium',
    description: 'Reduced salt content',
    restrictions: ['high-sodium', 'salt', 'sodium chloride'],
    keywords: ['low-sodium', 'low-salt', 'reduced sodium', 'salt-free']
  }
};

// Detect allergens in ingredient text
export function detectAllergens(ingredients: string): AllergenInfo[] {
  const detected: AllergenInfo[] = [];
  const ingredientLower = ingredients.toLowerCase();
  
  for (const [key, allergen] of Object.entries(ALLERGENS)) {
    for (const commonName of allergen.commonNames) {
      if (ingredientLower.includes(commonName.toLowerCase())) {
        detected.push(allergen);
        break; // Don't add the same allergen multiple times
      }
    }
  }
  
  return detected;
}

// Check diet compatibility based on ingredients
export function checkDietCompatibility(ingredients: string): DietCompatibility[] {
  const ingredientLower = ingredients.toLowerCase();
  const results: DietCompatibility[] = [];
  
  for (const [key, diet] of Object.entries(DIETS)) {
    let isCompatible = true;
    const reasons: string[] = [];
    const restrictions: string[] = [];
    
    // Check for restricted ingredients
    for (const restriction of diet.restrictions) {
      if (ingredientLower.includes(restriction.toLowerCase())) {
        isCompatible = false;
        restrictions.push(restriction);
      }
    }
    
    // Check for positive keywords
    for (const keyword of diet.keywords) {
      if (ingredientLower.includes(keyword.toLowerCase())) {
        reasons.push(`Contains ${keyword} ingredients`);
      }
    }
    
    // Calculate confidence based on ingredient analysis
    let confidence = 50; // Base confidence
    
    if (restrictions.length > 0) {
      confidence -= restrictions.length * 20; // Reduce confidence for each restriction
    }
    
    if (reasons.length > 0) {
      confidence += reasons.length * 10; // Increase confidence for positive indicators
    }
    
    confidence = Math.max(0, Math.min(100, confidence)); // Clamp between 0-100
    
    results.push({
      diet: diet.name,
      isCompatible,
      confidence,
      reasons,
      restrictions
    });
  }
  
  return results;
}

// Get allergen severity color
export function getAllergenSeverityColor(severity: string): string {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-100 border-red-300';
    case 'medium': return 'text-orange-600 bg-orange-100 border-orange-300';
    case 'low': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    default: return 'text-gray-600 bg-gray-100 border-gray-300';
  }
}

// Get diet compatibility color
export function getDietCompatibilityColor(isCompatible: boolean, confidence: number): string {
  if (isCompatible && confidence >= 80) return 'text-green-600 bg-green-100 border-green-300';
  if (isCompatible && confidence >= 60) return 'text-blue-600 bg-blue-100 border-blue-300';
  if (isCompatible) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
  return 'text-red-600 bg-red-100 border-red-300';
}
