import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContentSectionRow {
  id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  metadata?: any;
}

export const useContentSections = () => {
  const [sections, setSections] = useState<ContentSectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching content sections...');
        // Fetch all sections, not just active ones, so admin can see everything
        const { data, error } = await supabase
          .from('content_sections')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        if (!isMounted) return;
        console.log('✅ Content sections fetched:', data);
        setSections((data || []) as ContentSectionRow[]);
      } catch (e) {
        if (!isMounted) return;
        console.error('❌ Error fetching content sections:', e);
        setError(e instanceof Error ? e.message : 'Failed to load content');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('content_sections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_sections'
        },
        (payload) => {
          console.log('🔄 Content section change detected:', payload);
          console.log('📊 Current sections before update:', sections);
          // Refresh data when any change occurs
          fetchData();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const byType = useMemo(() => {
    const map = new Map<string, ContentSectionRow>();
    for (const s of sections) {
      if (!map.has(s.section_type)) map.set(s.section_type, s);
    }
    return map;
  }, [sections]);

  // Get only active sections for public interface
  const activeSections = useMemo(() => {
    return sections.filter(section => section.is_active);
  }, [sections]);

  const getSection = (type: string): ContentSectionRow | undefined => byType.get(type);
  const getMetadata = (type: string): any => getSection(type)?.metadata;

  return { sections, activeSections, isLoading, error, getSection, getMetadata };
}; 