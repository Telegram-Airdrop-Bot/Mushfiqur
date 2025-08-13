import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Star, CheckCircle, XCircle, Edit3, Save, X, Eye, Package } from 'lucide-react';

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  project_id: string | null;
  order_id: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  service_type: string;
  status: string;
  created_at: string;
}

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Review>>({});
  const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchOrders();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, service_type, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateReviewStatus = async (reviewId: string, field: 'is_approved' | 'is_featured', value: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ [field]: value })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, [field]: value } : review
      ));

      toast({
        title: "Success",
        description: `Review ${field === 'is_approved' ? 'approval' : 'featured'} status updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const startEditing = (review: Review) => {
    setEditingReview(review.id);
    setEditForm({
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      review_text: review.review_text
    });
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setEditForm({});
  };

  const saveEdit = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          reviewer_name: editForm.reviewer_name,
          rating: editForm.rating,
          review_text: editForm.review_text,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.map(review => 
        review.id === reviewId ? { 
          ...review, 
          reviewer_name: editForm.reviewer_name || review.reviewer_name,
          rating: editForm.rating || review.rating,
          review_text: editForm.review_text || review.review_text
        } : review
      ));

      setEditingReview(null);
      setEditForm({});

      toast({
        title: "Success",
        description: "Review updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.filter(review => review.id !== reviewId));
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const getOrderInfo = (orderId: string | null) => {
    if (!orderId) return null;
    return orders.find(order => order.id === orderId);
  };

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={`h-4 w-4 transition-colors ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews Management</h2>
        <div className="text-sm text-muted-foreground">
          Total Reviews: {reviews.length} | 
          Approved: {reviews.filter(r => r.is_approved).length} | 
          Pending: {reviews.filter(r => !r.is_approved).length} |
          Featured: {reviews.filter(r => r.is_featured).length}
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => {
          const orderInfo = getOrderInfo(review.order_id);
          const isEditing = editingReview === review.id;
          
          return (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    {isEditing ? (
                      <Input
                        value={editForm.reviewer_name || review.reviewer_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, reviewer_name: e.target.value }))}
                        className="text-lg font-semibold"
                      />
                    ) : (
                      <CardTitle className="text-lg">{review.reviewer_name}</CardTitle>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          {renderStars(editForm.rating || review.rating, true, (rating) => 
                            setEditForm(prev => ({ ...prev, rating }))
                          )}
                          <span className="text-sm text-muted-foreground">
                            {(editForm.rating || review.rating)}/5
                          </span>
                        </div>
                      ) : (
                        <>
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.rating}/5
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {review.is_approved ? (
                      <Badge variant="default">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                    {review.is_featured && (
                      <Badge variant="default">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Email:</strong> {review.reviewer_email}</p>
                      <p><strong>Date:</strong> {new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    {orderInfo && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p><strong>Order:</strong> {orderInfo.service_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {orderInfo.status} | {new Date(orderInfo.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowOrderDetails(showOrderDetails === review.id ? null : review.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {showOrderDetails === review.id && orderInfo && (
                    <div className="p-3 bg-muted/30 rounded-md border-l-4 border-primary">
                      <h4 className="font-semibold mb-2">Order Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p><strong>Customer:</strong> {orderInfo.customer_name}</p>
                        <p><strong>Service:</strong> {orderInfo.service_type}</p>
                        <p><strong>Status:</strong> {orderInfo.status}</p>
                        <p><strong>Order Date:</strong> {new Date(orderInfo.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p><strong>Review:</strong></p>
                    {isEditing ? (
                      <Textarea
                        value={editForm.review_text || review.review_text}
                        onChange={(e) => setEditForm(prev => ({ ...prev, review_text: e.target.value }))}
                        className="mt-1 min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                        {review.review_text}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`approved-${review.id}`}
                        checked={review.is_approved}
                        onCheckedChange={(checked) => updateReviewStatus(review.id, 'is_approved', checked)}
                      />
                      <Label htmlFor={`approved-${review.id}`}>Approved</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`featured-${review.id}`}
                        checked={review.is_featured}
                        onCheckedChange={(checked) => updateReviewStatus(review.id, 'is_featured', checked)}
                        disabled={!review.is_approved}
                      />
                      <Label htmlFor={`featured-${review.id}`}>Featured</Label>
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => saveEdit(review.id)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(review)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No reviews found.
        </div>
      )}
    </div>
  );
}