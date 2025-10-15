import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { User, MapPin, Calendar, UserCheck } from "lucide-react";

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  location: string;
  profilePicture?: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    gender: "",
    location: "",
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateProfile('profilePicture', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return profile.name.trim().length > 0;
      case 2: return profile.age > 0 && profile.age < 120;
      case 3: return profile.gender.length > 0;
      case 4: return profile.location.trim().length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">What's your name?</h3>
              <p className="text-muted-foreground">Let's personalize your experience</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                className="text-lg"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">How old are you?</h3>
              <p className="text-muted-foreground">This helps us provide age-appropriate recommendations</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={profile.age || ""}
                onChange={(e) => updateProfile('age', parseInt(e.target.value) || 0)}
                min="1"
                max="120"
                className="text-lg"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <UserCheck className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">What's your gender?</h3>
              <p className="text-muted-foreground">This helps us provide personalized health insights</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={profile.gender} onValueChange={(value) => updateProfile('gender', value)}>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Where do you live?</h3>
              <p className="text-muted-foreground">This helps us provide region-specific food recommendations</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">City/State</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Maharashtra"
                value={profile.location}
                onChange={(e) => updateProfile('location', e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-picture">Profile Picture (Optional)</Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Welcome to FoodDE! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {renderStep()}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-2 h-2 rounded-full ${
                  stepNumber === step
                    ? "bg-primary"
                    : stepNumber < step
                    ? "bg-primary/50"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="min-w-[80px]"
          >
            {step === 4 ? "Complete" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
