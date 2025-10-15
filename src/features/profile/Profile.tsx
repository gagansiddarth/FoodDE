import React, { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Edit, Save, X, Camera, MapPin, Calendar, User, UserCheck } from "lucide-react";
import { Seo } from "@/shared/components";
import { supabase } from "@/shared/utils/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/hooks/use-toast";
import { getUserProfile, updateUserProfile, getCurrentUserProfile, type UserProfile as DbUserProfile } from "@/shared/utils/profile";

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  location: string;
  profilePicture?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    gender: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth", { replace: true });
        return;
      }

      // Load profile from database
      const dbProfile = await getCurrentUserProfile();
      if (dbProfile) {
        setProfile({
          name: dbProfile.full_name || "",
          age: dbProfile.age || 0,
          gender: dbProfile.gender || "",
          location: dbProfile.location || "",
          profilePicture: dbProfile.avatar_url || undefined,
        });
      } else {
        // If no profile exists, create one with basic info
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await upsertUserProfile(user.id, user.email || '', {});
          // Load the newly created profile
          const newProfile = await getCurrentUserProfile();
          if (newProfile) {
            setProfile({
              name: newProfile.full_name || "",
              age: newProfile.age || 0,
              gender: newProfile.gender || "",
              location: newProfile.location || "",
              profilePicture: newProfile.avatar_url || undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Save to database
      const updatedProfile = await updateUserProfile(session.user.id, {
        full_name: profile.name || null,
        age: profile.age || null,
        gender: profile.gender || null,
        location: profile.location || null,
        avatar_url: profile.profilePicture || null,
        display_name: profile.name || null,
      });

      if (updatedProfile) {
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, profilePicture: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <main className="min-h-screen container py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen container py-10">
      <Seo 
        title="Profile – FoodDE" 
        description="Manage your FoodDE profile and preferences." 
        canonical="https://foodde.app/profile" 
      />
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Profile</h1>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.profilePicture} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <label htmlFor="profile-picture-upload" className="cursor-pointer">
                      <div className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors">
                        <Camera className="w-4 h-4" />
                      </div>
                    </label>
                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.name || "Not set"}</p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Age
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => updateProfile('age', parseInt(e.target.value) || 0)}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.age || "Not set"} {profile.age && "years old"}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Gender
                </Label>
                {isEditing ? (
                  <Select value={profile.gender} onValueChange={(value) => updateProfile('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-medium">
                    {profile.gender ? (
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                      </Badge>
                    ) : (
                      "Not set"
                    )}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    value={profile.location}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.location || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Profile;
