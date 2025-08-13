import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";

export const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { reviews: dbReviews, isLoading } = useReviews();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Use only database reviews - no fallback testimonials
  const testimonials = dbReviews.filter(review => review.is_approved);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance testimonials
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(nextTestimonial, 6000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };

  // Don't render anything if there are no approved testimonials
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          
          {/* Testimonials Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
              Client <span className="text-primary">Testimonials</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Real feedback from our satisfied clients
            </p>
          </div>

          {/* Testimonials Slider */}
          <div className="relative max-w-4xl mx-auto">
            {isLoading ? (
              <Card className="animate-pulse">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6" />
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-muted rounded mx-auto w-3/4" />
                    <div className="h-4 bg-muted rounded mx-auto w-1/2" />
                  </div>
                  <div className="h-12 bg-muted rounded mx-auto w-full mb-8" />
                  <div className="h-6 bg-muted rounded mx-auto w-1/3" />
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft hover:shadow-neon transition-all duration-500">
                        <CardContent className="p-8 text-center">
                          {/* Quote Icon */}
                          <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                              <Quote className="w-8 h-8 text-white" />
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex justify-center gap-1 mb-6">
                            {renderStars(testimonial.rating)}
                            <span className="text-sm text-muted-foreground ml-2">
                              {testimonial.rating}/5
                            </span>
                          </div>

                          {/* Review Text */}
                          <blockquote className="text-lg text-muted-foreground mb-8 italic leading-relaxed">
                            "{testimonial.review_text}"
                          </blockquote>

                          {/* Client Info */}
                          <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                              {testimonial.reviewer_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-primary">{testimonial.reviewer_name}</div>
                              <div className="text-sm text-muted-foreground">Verified Client</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(testimonial.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {testimonials.length > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="glow"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-primary shadow-neon' 
                          : 'bg-muted hover:bg-primary/50'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="glow"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};