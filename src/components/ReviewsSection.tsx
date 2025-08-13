import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { ReviewSubmissionForm } from "./ReviewSubmissionForm";

export const ReviewsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { reviews: dbReviews, isLoading } = useReviews();

  // Pagination settings
  const reviewsPerPage = 3;

  // Helper function for accurate average calculation
  const calculateAccurateAverage = (ratings: number[]): number => {
    if (ratings.length === 0) return 0;
    
    // Use reduce with proper precision handling
    const total = ratings.reduce((sum, rating) => {
      // Convert to integer to avoid floating point issues
      return sum + (rating * 10);
    }, 0);
    
    // Divide by count and convert back, then round to 1 decimal place
    return Math.round((total / ratings.length) / 10 * 10) / 10;
  };

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

  // Use only database reviews - no fallback reviews
  const reviews = dbReviews;
  
  // Filter approved reviews only
  const approvedReviews = reviews.filter(review => review.is_approved);
  
  // Filter featured reviews
  const featuredReviews = approvedReviews.filter(review => review.is_featured);

  // Calculate accurate average rating
  const averageRating = calculateAccurateAverage(approvedReviews.map(review => review.rating));

  // Pagination calculations
  const totalPages = Math.ceil(approvedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = approvedReviews.slice(startIndex, endIndex);

  // Featured reviews navigation
  const nextFeaturedReview = () => {
    if (featuredReviews.length > 0) {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredReviews.length);
    }
  };

  const prevFeaturedReview = () => {
    if (featuredReviews.length > 0) {
      setCurrentFeaturedIndex((prev) => 
        prev === 0 ? featuredReviews.length - 1 : prev - 1
      );
    }
  };

  // Auto-advance featured reviews
  useEffect(() => {
    if (featuredReviews.length > 1) {
      const interval = setInterval(nextFeaturedReview, 6000);
      return () => clearInterval(interval);
    }
  }, [featuredReviews.length]);

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when reviews change
  useEffect(() => {
    setCurrentPage(1);
  }, [approvedReviews.length]);

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

  return (
    <section 
      id="reviews"
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
          
          {/* Reviews Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
              Client <span className="text-primary">Reviews</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Share your experience with our services. Only customers with completed orders can submit reviews.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto text-center mb-32">
            <div>
              <div className="text-2xl font-bold text-primary text-glow">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary text-purple-glow">{approvedReviews.length}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary text-glow">
                {approvedReviews.length > 0 ? 
                  Math.round((approvedReviews.filter(review => review.rating === 5).length / approvedReviews.length) * 100) 
                  : 0
                }%
              </div>
              <div className="text-sm text-muted-foreground">5-Star Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary text-purple-glow">
                {approvedReviews.filter(review => review.rating === 5).length}
              </div>
              <div className="text-sm text-muted-foreground">5-Star Count</div>
            </div>
          </div>

          {/* Featured Review Carousel */}
          {featuredReviews.length > 0 && (
            <div className="w-full mb-32">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-neon">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    Featured Reviews
                </h3>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover what our most satisfied clients have to say about their experience
                </p>
              </div>

              <div className="relative w-full">
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-3xl -z-10" />
                
                <div className="relative">
                  {/* Main Review Card */}
                  <div className="w-full">
                    <Card className="bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-neon transition-all duration-500 overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardContent className="p-8 relative">
                              {/* Quote Icon */}
                              <div className="flex justify-center mb-6">
                          <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform duration-300">
                            <MessageSquare className="w-10 h-10 text-white" />
                                </div>
                              </div>

                        {/* Rating Stars */}
                        <div className="flex justify-center gap-2 mb-6">
                          {renderStars(featuredReviews[currentFeaturedIndex].rating)}
                          <span className="text-lg font-semibold text-primary ml-3 bg-white/10 px-3 py-1 rounded-full">
                            {featuredReviews[currentFeaturedIndex].rating}/5
                                </span>
                              </div>

                              {/* Review Text */}
                        <blockquote className="text-base text-center text-muted-foreground mb-8 italic leading-relaxed font-medium max-w-3xl mx-auto">
                          "{featuredReviews[currentFeaturedIndex].review_text}"
                              </blockquote>

                              {/* Client Info */}
                        <div className="flex items-center justify-center gap-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {featuredReviews[currentFeaturedIndex].reviewer_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg text-primary mb-1">
                              {featuredReviews[currentFeaturedIndex].reviewer_name}
                            </div>
                            <div className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full inline-block">
                              Verified Client
                                </div>
                            <div className="text-xs text-muted-foreground mt-2 opacity-75">
                              {new Date(featuredReviews[currentFeaturedIndex].created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                    </div>
                  </div>

                {/* Enhanced Navigation Dots */}
                {featuredReviews.length > 1 && (
                  <div className="flex justify-center items-center mt-10">
                    {/* Enhanced Dots Indicator */}
                    <div className="flex gap-3">
                      {featuredReviews.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentFeaturedIndex(index)}
                          className={`w-4 h-4 rounded-full transition-all duration-500 ${
                            index === currentFeaturedIndex 
                              ? 'bg-gradient-to-r from-primary to-secondary shadow-neon scale-125' 
                              : 'bg-white/30 hover:bg-white/50 hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Reviews Grid - Only show if there are approved reviews */}
          {approvedReviews.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4 text-secondary">
                <MessageSquare className="inline w-6 h-6 mr-2" />
                  Client Reviews
              </h3>
              <p className="text-muted-foreground">
                  Feedback from our valued clients
              </p>
            </div>

            <div className="grid gap-6">
              {isLoading ? (
                // Loading state
                  [...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3" />
                          <div className="h-3 bg-muted rounded w-1/4" />
                          <div className="h-16 bg-muted rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  {/* Show first 3 reviews by default */}
                    {currentReviews.map((review) => (
                    <Card key={review.id} className="bg-card/50 backdrop-blur-sm border-muted hover:shadow-soft transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {review.reviewer_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-primary">{review.reviewer_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-muted-foreground">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground text-right">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <blockquote className="text-muted-foreground italic leading-relaxed">
                              "{review.review_text}"
                            </blockquote>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-8">
                        <Button
                          variant="outline"
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="px-6"
                        >
                          Previous
                        </Button>
                        
                        {/* Page Numbers */}
                        <div className="flex gap-2">
                          {Array.from({ length: totalPages }, (_, index) => {
                            const pageNumber = index + 1;
                            // Show first page, last page, current page, and pages around current
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={pageNumber}
                                  variant={currentPage === pageNumber ? "default" : "outline"}
                                  onClick={() => goToPage(pageNumber)}
                                  className="w-10 h-10 p-0"
                                >
                                  {pageNumber}
                                </Button>
                              );
                            } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                            ) {
                              return (
                                <span key={pageNumber} className="px-2 text-muted-foreground">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                        
                      <Button
                        variant="outline"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="px-6"
                        >
                          Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          )}

          {/* Review Submission Form */}
          <div className="max-w-2xl mx-auto">
            <ReviewSubmissionForm />
          </div>
        </div>
      </div>
    </section>
  );
}; 