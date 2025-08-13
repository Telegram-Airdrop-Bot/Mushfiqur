import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  project_id: string;
  order_id: string;
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  return { reviews, isLoading, error, refetch: fetchReviews };
};