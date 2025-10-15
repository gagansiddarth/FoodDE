import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shield, Brain, Users, ArrowRight, Sparkles, TriangleAlert, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  ctaText: string;
  ctaAction: () => void;
  demoContent?: React.ReactNode;
}

interface LandingSliderProps {
  onScanClick: () => void;
  onCommunityClick: () => void;
}

const LandingSlider: React.FC<LandingSliderProps> = ({ onScanClick, onCommunityClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: Slide[] = [
    {
      id: 1,
      title: "FoodDE's Score Demo",
      subtitle: "See It In Action",
      description: "Watch how our AI analyzes ingredients and provides instant health insights with a real example.",
      icon: <Shield className="w-8 h-8 text-white" />,
      gradient: "from-blue-600 via-purple-600 to-indigo-600",
      ctaText: "Try It Yourself",
      ctaAction: onScanClick,
      demoContent: (
        <div className="text-center mb-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Cereal Bar Analysis</h4>
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl mb-2">
              68
            </div>
            <p className="text-sm text-muted-foreground">FoodDE's Score</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">Wheat flour</Badge>
            <Badge variant="destructive" className="text-xs">
              <TriangleAlert className="mr-1 w-3 h-3" /> E102
            </Badge>
            <Badge className="text-xs">Natural flavors</Badge>
            <Badge variant="secondary" className="text-xs">Palm oil</Badge>
            <Badge variant="secondary" className="text-xs">Sugar</Badge>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Smart Analysis",
      subtitle: "AI-Powered Insights",
      description: "Our advanced AI understands ingredients contextually, providing accurate health insights and flagging harmful additives in real-time.",
      icon: <Brain className="w-8 h-8 text-white" />,
      gradient: "from-emerald-600 via-green-600 to-teal-600",
      ctaText: "Start Analyzing",
      ctaAction: onScanClick,
      demoContent: (
        <div className="text-center mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Safe Ingredients</p>
              <p className="text-xs text-muted-foreground">Wheat, Natural flavors</p>
            </div>
            <div className="text-center">
              <TriangleAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="font-medium">Flagged</p>
              <p className="text-xs text-muted-foreground">E102, Palm oil</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Community Driven",
      subtitle: "Share & Discuss",
      description: "Join thousands of health-conscious users sharing scan results, discussing products, and debating food choices.",
      icon: <Users className="w-8 h-8 text-white" />,
      gradient: "from-orange-600 via-red-600 to-pink-600",
      ctaText: "Join Community",
      ctaAction: () => {
        // Navigate to community tab
        onCommunityClick();
      },
      demoContent: (
        <div className="text-center mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">2.5K</span>
              </div>
              <p className="font-medium">Active Users</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 dark:text-green-400 font-bold">15K+</span>
              </div>
              <p className="font-medium">Scans</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">500+</span>
              </div>
              <p className="font-medium">Ingredients</p>
            </div>
          </div>
          <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-700 dark:text-orange-300">
              💬 Share opinions • 🔄 Repost • ❤️ Like • 💭 Comment
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className="relative w-full h-full min-h-[500px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Slides Container */}
      <div className="relative w-full h-96 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
            style={{
              transform: index === currentSlide ? 'translateX(0)' : `translateX(${(index - currentSlide) * 100}%)`,
              zIndex: index === currentSlide ? 10 : 1
            }}
          >
            <Card className="h-full p-6 card-elevated relative overflow-hidden group">
              {/* Background Pattern */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-5`} />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {slide.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                    {slide.title}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {slide.subtitle}
                  </p>
                </div>
                
                {/* Demo Content */}
                {slide.demoContent}
                
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed flex-1">
                  {slide.description}
                </p>
                
                {/* CTA Button */}
                <div className="mt-auto">
                  <Button 
                    onClick={() => slide.ctaAction()}
                    className={`w-full bg-gradient-to-r ${slide.gradient} text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                    size="sm"
                  >
                    {slide.ctaText}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 dark:border-gray-700/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide 
                  ? 'bg-primary scale-125 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300 border border-white/20 dark:border-gray-700/20">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Auto-play Indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      </div>
    </div>
  );
};

export default LandingSlider;
