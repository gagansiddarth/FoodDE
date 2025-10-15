import React from "react";
import { AlertTriangle, Shield, Info, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface DisclaimerProps {
  variant?: "compact" | "detailed" | "full";
  showIcon?: boolean;
  className?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ 
  variant = "compact", 
  showIcon = true,
  className = ""
}) => {
  const compactDisclaimer = (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <div className="flex items-start gap-2">
        {showIcon && <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
        <span>
          <strong>Disclaimer:</strong> This analysis is for informational purposes only. 
          Results may vary and should not be considered professional medical or nutritional advice.
        </span>
      </div>
    </div>
  );

  const detailedDisclaimer = (
    <Card className={`p-4 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 ${className}`}>
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Important Disclaimer
          </h4>
          <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
            <p>
              <strong>Product Analysis:</strong> Our ingredient analysis and health scoring system is 
              designed for educational and informational purposes only. The FoodDE's scores and evaluations 
              provided are based on general nutritional guidelines and may not reflect individual health 
              conditions, allergies, or dietary requirements.
            </p>
            <p>
              <strong>Not Professional Advice:</strong> This analysis should not replace professional 
              medical, nutritional, or dietary advice. Always consult with qualified healthcare providers 
              or registered dietitians for personalized recommendations.
            </p>
            <p>
              <strong>Accuracy Limitations:</strong> While we strive for accuracy, ingredient lists, 
              nutritional information, and health assessments may contain errors or omissions. Product 
              formulations can change without notice.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );

  const fullDisclaimer = (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-200 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Comprehensive Legal Disclaimer
            </h3>
            
            <div className="text-sm text-red-700 dark:text-red-300 space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Product Analysis & Health Scoring</h4>
                <p>
                  FoodDE provides ingredient analysis and health scoring services for educational and 
                  informational purposes only. Our FoodDE's scores, ingredient evaluations, and nutritional 
                  assessments are based on general nutritional science, dietary guidelines, and publicly 
                  available information. These analyses are not intended to diagnose, treat, cure, or 
                  prevent any disease or health condition.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Not Professional Medical or Nutritional Advice</h4>
                <p>
                  The information provided by FoodDE should not be considered as professional medical, 
                  nutritional, or dietary advice. Always consult with qualified healthcare providers, 
                  registered dietitians, or licensed nutritionists before making significant changes to 
                  your diet or lifestyle, especially if you have existing health conditions, allergies, 
                  or dietary restrictions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Accuracy & Reliability Limitations</h4>
                <p>
                  While we strive to provide accurate and up-to-date information, our analyses may contain 
                  errors, omissions, or inaccuracies. Product formulations, ingredient lists, and nutritional 
                  information can change without notice. We cannot guarantee the accuracy, completeness, 
                  or reliability of any analysis results.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Individual Variations</h4>
                <p>
                  Health and nutritional needs vary significantly between individuals based on age, gender, 
                  health status, lifestyle, and other factors. Our general scoring system may not be 
                  appropriate for your specific circumstances. What may be healthy for one person could 
                  be harmful for another.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Third-Party Product Information</h4>
                <p>
                  Our analysis relies on publicly available information about products and ingredients. 
                  We are not responsible for the accuracy of third-party product information, ingredient 
                  lists, or nutritional data provided by manufacturers or retailers.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p>
                  FoodDE, its developers, and affiliates shall not be liable for any direct, indirect, 
                  incidental, special, or consequential damages arising from the use of our service, 
                  including but not limited to health issues, allergic reactions, or any other adverse 
                  effects that may result from following our recommendations or analysis results.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">User Responsibility</h4>
                <p>
                  Users are solely responsible for their health decisions and any consequences that may 
                  result from using our service. Always verify information independently and consult 
                  appropriate professionals when making health-related decisions.
                </p>
              </div>

              <div className="pt-3 border-t border-red-300 dark:border-red-700">
                <p className="font-medium">
                  By using FoodDE, you acknowledge that you have read, understood, and agree to this 
                  disclaimer. If you do not agree with any part of this disclaimer, please discontinue 
                  use of our service immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          <Info className="w-3 h-3 mr-1" />
          Educational Purpose Only
        </Badge>
        <Badge variant="outline" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Not Medical Advice
        </Badge>
        <Badge variant="outline" className="text-xs">
          <FileText className="w-3 h-3 mr-1" />
          Verify Independently
        </Badge>
      </div>
    </div>
  );

  switch (variant) {
    case "compact":
      return compactDisclaimer;
    case "detailed":
      return detailedDisclaimer;
    case "full":
      return fullDisclaimer;
    default:
      return compactDisclaimer;
  }
};

export default Disclaimer;
