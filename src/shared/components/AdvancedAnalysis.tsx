import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Info,
  AlertCircle,
  Leaf,
  Heart,
  Zap,
  Star
} from 'lucide-react';

// Simplified interfaces to avoid import issues
interface SimpleAllergenInfo {
  name: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  commonNames: string[];
}

interface SimpleDietCompatibility {
  diet: string;
  isCompatible: boolean;
  confidence: number;
  reasons: string[];
  restrictions: string[];
}

interface AdvancedAnalysisProps {
  ingredients: string;
  allergens: SimpleAllergenInfo[];
  dietCompatibility: SimpleDietCompatibility[];
}

const AdvancedAnalysis: React.FC<AdvancedAnalysisProps> = ({ 
  ingredients, 
  allergens = [], 
  dietCompatibility = [] 
}) => {
  // Safety check - if no data, show a simple message
  if (!ingredients || ingredients.trim() === '') {
    return (
      <Card className="p-6 card-elevated">
        <div className="text-center py-6">
          <Info className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="text-blue-800 dark:text-blue-200 font-medium">Advanced Analysis</p>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced ingredient analysis will appear here after scanning.
          </p>
        </div>
      </Card>
    );
  }

  const getDietIcon = (diet: string) => {
    switch (diet.toLowerCase()) {
      case 'vegan': return <Leaf className="w-4 h-4" />;
      case 'vegetarian': return <Leaf className="w-4 h-4" />;
      case 'keto': return <Zap className="w-4 h-4" />;
      case 'paleo': return <Star className="w-4 h-4" />;
      case 'halal': return <Shield className="w-4 h-4" />;
      case 'kosher': return <Shield className="w-4 h-4" />;
      case 'diabetic-friendly': return <Heart className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getDietDescription = (diet: string) => {
    switch (diet.toLowerCase()) {
      case 'vegan': return 'No animal products or by-products';
      case 'vegetarian': return 'No meat but may include dairy and eggs';
      case 'keto': return 'Low-carb, high-fat diet';
      case 'paleo': return 'Based on foods available to Paleolithic humans';
      case 'halal': return 'Permissible according to Islamic law';
      case 'kosher': return 'Foods that conform to Jewish dietary law';
      case 'diabetic-friendly': return 'Low glycemic index and sugar content';
      case 'gluten-free': return 'No gluten-containing grains';
      case 'dairy-free': return 'No milk or milk products';
      case 'low-sodium': return 'Reduced salt content';
      default: return 'Diet-specific analysis';
    }
  };

  const getAllergenSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-300';
      case 'medium': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'low': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getDietCompatibilityColor = (isCompatible: boolean, confidence: number) => {
    if (isCompatible && confidence >= 80) return 'text-green-600 bg-green-100 border-green-300';
    if (isCompatible && confidence >= 60) return 'text-blue-600 bg-blue-100 border-blue-300';
    if (isCompatible) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Allergen Detection */}
      <Card className="p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Allergen Detection</h2>
        </div>
        
        {allergens && allergens.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              The following allergens were detected in the ingredients:
            </p>
            {allergens.map((allergen, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getAllergenSeverityColor(allergen.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{allergen.name}</span>
                      <Badge 
                        variant={allergen.severity === 'high' ? 'destructive' : allergen.severity === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {allergen.severity.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <p className="text-sm">{allergen.description}</p>
                    <p className="text-xs mt-1 opacity-75">
                      <strong>Common names:</strong> {allergen.commonNames.slice(0, 5).join(', ')}
                      {allergen.commonNames.length > 5 && ` +${allergen.commonNames.length - 5} more`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-800 dark:text-green-200 font-medium">No Common Allergens Detected</p>
            <p className="text-sm text-muted-foreground mt-1">
              This product appears to be free of major allergens, but always check labels carefully.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Important Note:</p>
              <p>This analysis detects common allergens but may not identify all potential allergens. Always read product labels carefully and consult with healthcare providers if you have food allergies.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Diet Compatibility */}
      <Card className="p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Diet Compatibility</h2>
        </div>
        
        {dietCompatibility && dietCompatibility.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {dietCompatibility.map((diet, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getDietCompatibilityColor(diet.isCompatible, diet.confidence)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getDietIcon(diet.diet)}
                    <h3 className="font-semibold">{diet.diet}</h3>
                  </div>
                  <div className="text-right">
                    {diet.isCompatible ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
                
                <p className="text-sm mb-3">{getDietDescription(diet.diet)}</p>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Compatibility:</span>
                    <span className="font-medium">{diet.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        diet.isCompatible && diet.confidence >= 80 ? 'bg-green-500' :
                        diet.isCompatible && diet.confidence >= 60 ? 'bg-blue-500' :
                        diet.isCompatible ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${diet.confidence}%` }}
                    ></div>
                  </div>
                </div>
                
                {diet.reasons && diet.reasons.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-green-700 mb-1">✅ Compatible because:</p>
                    <ul className="text-xs space-y-1">
                      {diet.reasons.map((reason, idx) => (
                        <li key={idx} className="text-green-700">• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {diet.restrictions && diet.restrictions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">❌ Contains restricted ingredients:</p>
                    <ul className="text-xs space-y-1">
                      {diet.restrictions.map((restriction, idx) => (
                        <li key={idx} className="text-red-700">• {restriction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Info className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-blue-800 dark:text-blue-200 font-medium">Diet Analysis</p>
            <p className="text-sm text-muted-foreground mt-1">
              Diet compatibility analysis will appear here after scanning.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">Diet Compatibility Note:</p>
              <p>This analysis provides guidance based on ingredient detection. For strict dietary requirements, always verify with product labels and consult nutrition professionals.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedAnalysis;
