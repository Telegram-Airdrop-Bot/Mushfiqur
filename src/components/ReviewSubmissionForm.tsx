import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  service_type: string;
  project_description: string;
  status: string;
  created_at: string;
}

interface ReviewForm {
  reviewer_name: string;
  reviewer_email: string;
  order_id: string;
  rating: number;
  review_text: string;
}

export const ReviewSubmissionForm = () => {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    reviewer_name: "",
    reviewer_email: "",
    order_id: "",
    rating: 5,
    review_text: ""
  });

  const searchOrders = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search for orders with this email and completed status
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email.trim().toLowerCase())
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(data);
        setReviewForm(prev => ({
          ...prev,
          reviewer_email: email.trim().toLowerCase(),
          reviewer_name: data[0].customer_name // Pre-fill with first order's name
        }));
      } else {
        setOrders([]);
        toast({
          title: "No Orders Found",
          description: "We couldn't find any completed orders with this email address. Please check your email or contact support if you believe this is an error.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      toast({
        title: "Error",
        description: "Failed to search for orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setReviewForm(prev => ({
        ...prev,
        order_id: orderId,
        reviewer_name: order.customer_name
      }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (field: keyof ReviewForm, value: string) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  const submitReview = async () => {
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "Please select an order to review",
        variant: "destructive",
      });
      return;
    }

    if (!reviewForm.review_text.trim()) {
      toast({
        title: "Error",
        description: "Please write your review",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, try to find the project that matches this order's service_type
      let project_id = null;
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('title', selectedOrder.service_type)
          .single();

        if (!projectError && projectData) {
          project_id = projectData.id;
        }
      } catch (error) {
        // If no project found, that's okay - review will be linked only to order
        console.log('No matching project found for service type:', selectedOrder.service_type);
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          reviewer_name: reviewForm.reviewer_name,
          reviewer_email: reviewForm.reviewer_email,
          order_id: reviewForm.order_id,
          project_id: project_id,
          rating: reviewForm.rating,
          review_text: reviewForm.review_text.trim(),
          is_approved: false, // Admin must approve first
          is_featured: false
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Review Submitted Successfully!",
        description: "Thank you for your feedback! Your review will be visible after admin approval.",
      });

      // Reset form
      setReviewForm({
        reviewer_name: "",
        reviewer_email: "",
        order_id: "",
        rating: 5,
        review_text: ""
      });
      setSelectedOrder(null);
      setOrders([]);
      setEmail("");
      setHasSearched(false);

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            disabled={!interactive}
            onClick={() => interactive && handleRatingChange(star)}
            className={`w-6 h-6 transition-colors ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-muted shadow-soft">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">
          <CheckCircle className="inline w-6 h-6 mr-2" />
          Submit Your Review
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Share your experience with our services. Only customers with completed orders can submit reviews.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Email Search Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Your Email Address</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter the email you used for your order"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchOrders()}
              />
              <Button
                onClick={searchOrders}
                disabled={isSearching || !email.trim()}
                className="px-6"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-3">
              {orders.length > 0 ? (
                <div className="space-y-2">
                  <Label>Select Order to Review:</Label>
                  <Select
                    value={selectedOrder?.id || ""}
                    onValueChange={handleOrderSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an order to review" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.service_type}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    No completed orders found with this email address.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Form - Only show if order is selected */}
        {selectedOrder && (
          <div className="space-y-4 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reviewer_name">Your Name</Label>
                <Input
                  id="reviewer_name"
                  value={reviewForm.reviewer_name}
                  onChange={(e) => handleInputChange('reviewer_name', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="reviewer_email">Email (Read-only)</Label>
                <Input
                  id="reviewer_email"
                  value={reviewForm.reviewer_email}
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div>
              <Label>Rating</Label>
              <div className="mt-2">
                {renderStars(reviewForm.rating, true)}
                <span className="ml-2 text-sm text-muted-foreground">
                  {reviewForm.rating}/5 stars
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="review_text">Your Review</Label>
              <Textarea
                id="review_text"
                value={reviewForm.review_text}
                onChange={(e) => handleInputChange('review_text', e.target.value)}
                placeholder="Share your experience with our service. What did you like? How did it help you?"
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Reviewing: <strong>{selectedOrder.service_type}</strong> 
                (Ordered on {new Date(selectedOrder.created_at).toLocaleDateString()})
              </span>
            </div>

            <Button
              onClick={submitReview}
              disabled={isSubmitting || !reviewForm.review_text.trim()}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting Review...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        )}

        {/* Instructions */}
        {!hasSearched && (
          <div className="text-center p-4 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground">
              Enter your email address above to find your completed orders and submit a review.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 