import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  technologies: string[];
  github_url: string;
  demo_url: string;
  category: string;
  is_featured: boolean;
  sort_order: number;
}

interface ProjectWithReviews extends Project {
  review_count: number;
  five_star_count: number;
  average_rating: number;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectWithReviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // First, fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (projectsError) throw projectsError;

      // Then, fetch review statistics for each project
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('project_id, rating, is_approved')
        .eq('is_approved', true);

      if (reviewsError) throw reviewsError;

      // Calculate review statistics for each project
      const projectsWithReviews = (projectsData || []).map(project => {
        const projectReviews = reviewsData?.filter(review => 
          review.project_id === project.id
        ) || [];

        const review_count = projectReviews.length;
        const five_star_count = projectReviews.filter(review => review.rating === 5).length;
        const average_rating = calculateAccurateAverage(projectReviews.map(review => review.rating));

        return {
          ...project,
          review_count,
          five_star_count,
          average_rating
        };
      });

      setProjects(projectsWithReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  return { projects, isLoading, error, refetch: fetchProjects };
};