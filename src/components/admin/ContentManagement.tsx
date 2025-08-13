import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentSection {
  id: string;
  section_type: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  metadata?: any;
}

export function ContentManagement() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const newSection: Partial<ContentSection> = {
    section_type: '',
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
  };

  const fetchSections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Failed to fetch content sections:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSections();
    
    // Set up real-time subscription for content sections
    const channel = supabase
      .channel('content_sections_admin_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_sections'
        },
        (payload) => {
          console.log('Content section change detected in admin:', payload);
          // Refresh data when any change occurs
          fetchSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSections]);

  // Create default settings section if it doesn't exist
  const createDefaultSettings = useCallback(async () => {
    try {
      // Check if settings section exists
      const { data: existingSettings } = await supabase
        .from('content_sections')
        .select('id')
        .eq('section_type', 'settings')
        .single();

      if (!existingSettings) {
        // Create default settings section
        const defaultSettings = {
          section_type: 'settings',
          title: 'Site Settings',
          subtitle: 'Website configuration and branding',
          content: 'Configure your website settings, branding, and social links',
          image_url: '',
          is_active: true,
          sort_order: 999,
          metadata: {
            brandName: "Mushfiq's Bots",
            logoUrl: '',
            links: {
              fiverrUrl: 'https://fiverr.com',
              telegramUrl: 'https://t.me/mushfiqmoon',
              email: 'moonbd01717@gmail.com',
              linkedin: 'https://www.linkedin.com/in/md-moshfiqur-rahman-951039232/'
            }
          }
        };

        const { error } = await supabase
          .from('content_sections')
          .insert([defaultSettings]);

        if (error) {
          console.error('Failed to create default settings:', error);
        } else {
          console.log('Default settings section created');
          // Refresh the list after a short delay to avoid circular dependency
          setTimeout(() => {
            fetchSections();
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error checking/creating default settings:', error);
    }
  }, [supabase, fetchSections]);

  useEffect(() => {
    createDefaultSettings();
  }, [createDefaultSettings]);

  const saveSection = async (section: Partial<ContentSection>) => {
    try {
      // Parse metadata if provided as string
      let payload: any = { ...section };
      if (typeof (payload as any).metadata === 'string' && (payload as any).metadata.trim().length > 0) {
        try {
          payload.metadata = JSON.parse((payload as any).metadata);
        } catch (e) {
          toast({
            title: "Invalid Metadata",
            description: "Metadata must be valid JSON.",
            variant: "destructive",
          });
          return;
        }
      }

      if (section.id) {
        // Update existing
        const { error } = await supabase
          .from('content_sections')
          .update(payload)
          .eq('id', section.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Section updated successfully",
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('content_sections')
          .insert([payload as any]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Section created successfully",
        });
      }

      await fetchSections();
      setEditingSection(null);
      setIsCreating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      });
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('content_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      await fetchSections();
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderMetadataPreview = (metadata: any, sectionType: string) => {
    if (!metadata) return <span className="text-muted-foreground text-sm">No metadata</span>;

    switch (sectionType) {
      case 'hero':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Headline:</strong> {metadata.headline || 'Not set'}</div>
              <div><strong>Subheadline:</strong> {metadata.subheadline || 'Not set'}</div>
            </div>
            {metadata.stats && (
              <div className="flex gap-2">
                {Object.entries(metadata.stats).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-2">
            <div className="text-sm"><strong>About Copy:</strong> {metadata.aboutCopy || 'Not set'}</div>
            {metadata.skills && (
              <div className="flex flex-wrap gap-1">
                {metadata.skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill.name} ({skill.level}%)
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'services':
        return (
          <div className="space-y-2">
            {metadata.services && metadata.services.map((service: any, index: number) => (
              <div key={index} className="text-sm border-l-2 border-primary pl-2">
                <strong>{service.title}</strong>
                <div className="text-muted-foreground">{service.description}</div>
              </div>
            ))}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-2">
            <div className="text-sm"><strong>Brand:</strong> {metadata.brandName || 'Not set'}</div>
            {metadata.links && (
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(metadata.links).map(([key, value]) => (
                  <div key={key}><strong>{key}:</strong> {String(value).substring(0, 30)}...</div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-xs text-muted-foreground max-w-xs truncate">
            {JSON.stringify(metadata).substring(0, 100)}...
          </div>
        );
    }
  };

  const SectionForm = ({ section, onSave, onCancel }: {
    section: Partial<ContentSection>;
    onSave: (section: Partial<ContentSection>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(section);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const renderStructuredMetadataForm = () => {
      switch (formData.section_type) {
        case 'hero':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={formData.metadata?.headline || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, headline: e.target.value }
                    })}
                    placeholder="I Build Bots That"
                  />
                </div>
                <div>
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Input
                    id="subheadline"
                    value={formData.metadata?.subheadline || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, subheadline: e.target.value }
                    })}
                    placeholder="Telegram, Discord, Web Automation & More |"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="years">Years Experience</Label>
                  <Input
                    id="years"
                    value={formData.metadata?.stats?.years || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { 
                        ...formData.metadata, 
                        stats: { ...formData.metadata?.stats, years: e.target.value }
                      }
                    })}
                    placeholder="2+"
                  />
                </div>
                <div>
                  <Label htmlFor="projects">Projects</Label>
                  <Input
                    id="projects"
                    value={formData.metadata?.stats?.projects || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { 
                        ...formData.metadata, 
                        stats: { ...formData.metadata?.stats, projects: e.target.value }
                      }
                    })}
                    placeholder="30+"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    value={formData.metadata?.stats?.rating || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { 
                        ...formData.metadata, 
                        stats: { ...formData.metadata?.stats, rating: e.target.value }
                      }
                    })}
                    placeholder="5⭐"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fiverrUrl">Fiverr URL</Label>
                <Input
                  id="fiverrUrl"
                  value={formData.metadata?.ctas?.fiverrUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { 
                      ...formData.metadata, 
                      ctas: { ...formData.metadata?.ctas, fiverrUrl: e.target.value }
                    }
                  })}
                  placeholder="https://fiverr.com/..."
                />
              </div>
            </div>
          );

        case 'about':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="aboutCopy">About Copy</Label>
                <Textarea
                  id="aboutCopy"
                  value={formData.metadata?.aboutCopy || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, aboutCopy: e.target.value }
                  })}
                  placeholder="I'm a bot automation expert..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Skills</Label>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                    <div key={index} className="grid grid-cols-4 gap-2">
                      <Input
                        placeholder="Skill name"
                        value={formData.metadata?.skills?.[index]?.name || ''}
                        onChange={(e) => {
                          const newSkills = [...(formData.metadata?.skills || [])];
                          if (!newSkills[index]) newSkills[index] = {};
                          newSkills[index] = { ...newSkills[index], name: e.target.value };
                          setFormData({
                            ...formData,
                            metadata: { ...formData.metadata, skills: newSkills }
                          });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Level %"
                        value={formData.metadata?.skills?.[index]?.level || ''}
                        onChange={(e) => {
                          const newSkills = [...(formData.metadata?.skills || [])];
                          if (!newSkills[index]) newSkills[index] = {};
                          newSkills[index] = { ...newSkills[index], level: parseInt(e.target.value) || 0 };
                          setFormData({
                            ...formData,
                            metadata: { ...formData.metadata, skills: newSkills }
                          });
                        }}
                      />
                      <Select
                        value={formData.metadata?.skills?.[index]?.color || 'text-primary'}
                        onValueChange={(value) => {
                          const newSkills = [...(formData.metadata?.skills || [])];
                          if (!newSkills[index]) newSkills[index] = {};
                          newSkills[index] = { ...newSkills[index], color: value };
                          setFormData({
                            ...formData,
                            metadata: { ...formData.metadata, skills: newSkills }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-primary">Primary</SelectItem>
                          <SelectItem value="text-secondary">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'services':
          return (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Service Title</Label>
                      <Input
                        placeholder="Service name"
                        value={formData.metadata?.services?.[index]?.title || ''}
                        onChange={(e) => {
                          const newServices = [...(formData.metadata?.services || [])];
                          if (!newServices[index]) newServices[index] = {};
                          newServices[index] = { ...newServices[index], title: e.target.value };
                          setFormData({
                            ...formData,
                            metadata: { ...formData.metadata, services: newServices }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Service description"
                        value={formData.metadata?.services?.[index]?.description || ''}
                        onChange={(e) => {
                          const newServices = [...(formData.metadata?.services || [])];
                          if (!newServices[index]) newServices[index] = {};
                          newServices[index] = { ...newServices[index], description: e.target.value };
                          setFormData({
                            ...formData,
                            metadata: { ...formData.metadata, services: newServices }
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Features (comma separated)</Label>
                    <Input
                      placeholder="Feature 1, Feature 2, Feature 3"
                      value={formData.metadata?.services?.[index]?.features?.join(', ') || ''}
                      onChange={(e) => {
                        const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                        const newServices = [...(formData.metadata?.services || [])];
                        if (!newServices[index]) newServices[index] = {};
                        newServices[index] = { ...newServices[index], features };
                        setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, services: newServices }
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          );

        case 'settings':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={formData.metadata?.brandName || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, brandName: e.target.value }
                  })}
                  placeholder="Mushfiq's Bots"
                />
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.metadata?.logoUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, logoUrl: e.target.value }
                  })}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the URL of your logo image. Leave empty to use default Bot icon.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fiverrUrl">Fiverr URL</Label>
                  <Input
                    id="fiverrUrl"
                    value={formData.metadata?.links?.fiverrUrl || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { 
                        ...formData.metadata, 
                        links: { ...formData.metadata?.links, fiverrUrl: e.target.value }
                      }
                    })}
                    placeholder="https://fiverr.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="telegramUrl">Telegram URL</Label>
                  <Input
                    id="telegramUrl"
                    value={formData.metadata?.links?.telegramUrl || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { 
                        ...formData.metadata, 
                        links: { ...formData.metadata?.links, telegramUrl: e.target.value }
                      }
                    })}
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.metadata?.links?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { 
                        ...formData.metadata, 
                        links: { ...formData.metadata?.links, email: e.target.value }
                      }
                    })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.metadata?.links?.linkedin || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { 
                        ...formData.metadata, 
                        links: { ...formData.metadata?.links, linkedin: e.target.value }
                      }
                    })}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div>
              <Label htmlFor="metadata">Metadata (JSON)</Label>
              <Textarea
                id="metadata"
                value={typeof (formData as any).metadata === 'string' || (formData as any).metadata == null ? ((formData as any).metadata || '') : JSON.stringify((formData as any).metadata, null, 2)}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value as any })}
                placeholder="Enter JSON metadata"
                rows={8}
              />
              <p className="text-xs text-muted-foreground mt-1">Use this for custom section types</p>
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {section.id ? 'Edit Section' : 'Create New Section'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section_type">Section Type</Label>
                <Select
                  value={formData.section_type}
                  onValueChange={(value) => setFormData({ ...formData, section_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="about">About Section</SelectItem>
                    <SelectItem value="services">Services Section</SelectItem>
                    <SelectItem value="settings">Site Settings</SelectItem>
                    <SelectItem value="custom">Custom Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Section title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Section subtitle"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Section content"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            {formData.section_type && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-medium">Metadata Configuration</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>
                
                {showAdvanced ? (
                  <div className="space-y-4">
                    {renderStructuredMetadataForm()}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Click "Show Advanced" to configure section-specific metadata
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Section
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading content sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage your website content and sections</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {/* Debug Section - Remove in production */}
      {/* <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">🔧 Debug: Real-time Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Total Sections:</strong> {sections.length}</div>
            <div><strong>Active Sections:</strong> {sections.filter(s => s.is_active).length}</div>
            <div><strong>Last Updated:</strong> {new Date().toLocaleTimeString()}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('🔍 Current sections:', sections);
                console.log('🔍 Active sections:', sections.filter(s => s.is_active));
              }}
            >
              Log Current State
            </Button>
          </div>
        </CardContent>
      </Card> */}

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.section_type}
                    </Badge>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Order: {section.sort_order}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectionExpansion(section.id)}
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSection(section)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedSections.has(section.id) && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Subtitle</Label>
                      <p className="text-sm text-muted-foreground">{section.subtitle || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Content</Label>
                      <p className="text-sm text-muted-foreground">{section.content || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={section.is_active ? "default" : "secondary"}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Metadata Preview</Label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      {renderMetadataPreview(section.metadata, section.section_type)}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {isCreating && (
        <SectionForm
          section={newSection}
          onSave={saveSection}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingSection && (
        <SectionForm
          section={editingSection}
          onSave={saveSection}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  );
}