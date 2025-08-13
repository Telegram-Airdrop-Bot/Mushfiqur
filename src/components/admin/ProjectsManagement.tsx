import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, ExternalLink, Star, Filter, Upload, Image as ImageIcon, AlertCircle, Eye, ZoomIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImagePreview } from './ImagePreview';

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
  has_web_preview: boolean;
  image_preview_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  demo_url?: string;
  github_url?: string;
  image_url?: string;
}

export function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(6);
  
  const { toast } = useToast();

  // Predefined categories from the user interface
  const availableCategories = [
    { id: "all", label: "All Categories" },
    { id: "telegram", label: "Telegram Bots" },
    { id: "miniapp", label: "Mini Apps" },
    { id: "react", label: "React.js" },
    { id: "discord", label: "Discord Bots" },
    { id: "trading", label: "Trading Bots" },
    { id: "scraping", label: "Web Scraping" },
    { id: "ai", label: "AI Bots" },
    { id: "automation", label: "Automation" }
  ];

  const newProject: Partial<Project> = {
    title: '',
    description: '',
    image_url: '',
    technologies: [],
    github_url: '',
    demo_url: '',
    category: '',
    is_featured: false,
    sort_order: 0,
    has_web_preview: false,
    image_preview_enabled: true,
  };

  // Separate state for featured projects
  const featuredProjects = projects.filter(project => project.is_featured);
  const regularProjects = projects.filter(project => !project.is_featured);

  // Filter projects by selected category
  const filteredFeaturedProjects = selectedCategory === 'all' 
    ? featuredProjects 
    : featuredProjects.filter(project => project.category === selectedCategory);
  
  const filteredRegularProjects = selectedCategory === 'all' 
    ? regularProjects 
    : regularProjects.filter(project => project.category === selectedCategory);

  // Pagination logic
  const totalProjects = filteredRegularProjects.length;
  const totalPages = Math.ceil(totalProjects / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredRegularProjects.slice(startIndex, endIndex);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Update URL hash when page changes
  useEffect(() => {
    if (totalPages > 1) {
      const hash = `#page=${currentPage}`;
      if (window.location.hash !== hash) {
        window.location.hash = hash;
      }
    }
  }, [currentPage, totalPages]);

  // Load page from URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash;
    const pageMatch = hash.match(/#page=(\d+)/);
    if (pageMatch) {
      const page = parseInt(pageMatch[1]);
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  }, [totalPages]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle keyboard events when typing in form fields
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
          break;
        case 'ArrowRight':
          if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
          }
          break;
        case 'Home':
          setCurrentPage(1);
          break;
        case 'End':
          setCurrentPage(totalPages);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Transform data to include default values for new fields
      const transformedData = (data || []).map(project => ({
        ...project,
        has_web_preview: (project as any).has_web_preview ?? false,
        image_preview_enabled: (project as any).image_preview_enabled ?? true,
        technologies: project.technologies || [],
        created_at: project.created_at || new Date().toISOString(),
        updated_at: project.updated_at || new Date().toISOString(),
      })) as Project[];
      
      setProjects(transformedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateProject = (project: Partial<Project>): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    if (!project.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!project.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!project.category) {
      errors.category = 'Category is required';
    }

    // Validate demo URL only if web preview is enabled
    if (project.has_web_preview && project.demo_url && !isValidUrl(project.demo_url)) {
      errors.demo_url = 'Please enter a valid demo URL';
    }

    // Validate GitHub URL if provided
    if (project.github_url && !isValidUrl(project.github_url)) {
      errors.github_url = 'Please enter a valid GitHub URL';
    }

    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // This is a placeholder - implement actual image upload to your storage service
    // For now, we'll return a blob URL
    return URL.createObjectURL(file);
  };

  const saveProject = async (project: Partial<Project>) => {
    const errors = validateProject(project);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    try {
      // Ensure image_url is included if it exists
      const projectData = {
        ...project,
        updated_at: new Date().toISOString()
      };

      if (project.id) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
        setEditingProject(null);
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            created_at: new Date().toISOString(),
          } as any);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Project created successfully",
        });
        setIsCreating(false);
      }

      await fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  // Enhanced featured project management
  const toggleFeatured = async (projectId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          is_featured: isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Project ${isFeatured ? 'marked as' : 'removed from'} featured`,
      });
      
      await fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  // Bulk featured project operations
  const bulkToggleFeatured = async (projectIds: string[], isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          is_featured: isFeatured,
          updated_at: new Date().toISOString()
        })
        .in('id', projectIds);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${projectIds.length} projects ${isFeatured ? 'marked as' : 'removed from'} featured`,
      });
      
      await fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update projects",
        variant: "destructive",
      });
    }
  };

  // Enhanced project deletion with confirmation
  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      
      await fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  // Enhanced project sorting
  const updateSortOrder = async (projectId: string, newSortOrder: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          sort_order: newSortOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;
      
      await fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sort order",
        variant: "destructive",
      });
    }
  };

  const ProjectForm = ({ project, onSave, onCancel }: {
    project: Partial<Project>;
    onSave: (project: Partial<Project>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(project);
    const [techInput, setTechInput] = useState('');

    const addTechnology = () => {
      if (techInput.trim()) {
        setFormData({
          ...formData,
          technologies: [...(formData.technologies || []), techInput.trim()]
        });
        setTechInput('');
      }
    };

    const removeTechnology = (index: number) => {
      setFormData({
        ...formData,
        technologies: formData.technologies?.filter((_, i) => i !== index) || []
      });
    };

    const handleImageChange = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
    };

    const handleImageRemove = () => {
      setFormData({ ...formData, image_url: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{project.id ? 'Edit Project' : 'Create New Project'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project title"
                    className={validationErrors.title ? 'border-red-500' : ''}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project"
                    rows={4}
                    className={validationErrors.description ? 'border-red-500' : ''}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category || ''}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.filter(cat => cat.id !== 'all').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.category && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    value={formData.github_url || ''}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username/repo"
                    className={validationErrors.github_url ? 'border-red-500' : ''}
                  />
                  {validationErrors.github_url && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.github_url}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Mark as Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="has_web_preview"
                    checked={formData.has_web_preview || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_web_preview: checked })}
                  />
                  <Label htmlFor="has_web_preview">Has Web Preview</Label>
                </div>

                {formData.has_web_preview && (
                  <div>
                    <Label htmlFor="demo_url">Demo URL</Label>
                    <Input
                      id="demo_url"
                      value={formData.demo_url || ''}
                      onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                      placeholder="https://demo.example.com"
                      className={validationErrors.demo_url ? 'border-red-500' : ''}
                    />
                    {validationErrors.demo_url && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.demo_url}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="image_preview_enabled"
                    checked={formData.image_preview_enabled || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, image_preview_enabled: checked })}
                  />
                  <Label htmlFor="image_preview_enabled">Enable Image Preview</Label>
                </div>

                {/* Quick Image URL Input */}
                {formData.image_preview_enabled && (
                  <div>
                    <Label htmlFor="quick_image_url">Quick Image URL (Optional)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="quick_image_url"
                        type="url"
                        value={formData.image_url && !formData.image_url.startsWith('data:image') ? formData.image_url : ''}
                        onChange={(e) => {
                          const url = e.target.value.trim();
                          if (url) {
                            setFormData({ ...formData, image_url: url });
                          } else {
                            setFormData({ ...formData, image_url: '' });
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const demoUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop";
                          setFormData({ ...formData, image_url: demoUrl });
                        }}
                        title="Use demo image for testing"
                      >
                        Demo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter an image URL to quickly add an image, or use the upload tool on the right
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Image Preview Component */}
                {formData.image_preview_enabled && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Project Image</Label>
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="text-sm font-medium">Image Source:</div>
                        <div className="flex gap-1 p-1 bg-background rounded border">
                          <button
                            type="button"
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              !formData.image_url || formData.image_url.startsWith('data:image')
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              if (formData.image_url && !formData.image_url.startsWith('data:image')) {
                                setFormData({ ...formData, image_url: '' });
                              }
                            }}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              formData.image_url && !formData.image_url.startsWith('data:image')
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              if (!formData.image_url || formData.image_url.startsWith('data:image')) {
                                setFormData({ ...formData, image_url: '' });
                              }
                            }}
                          >
                            URL Input
                          </button>
                        </div>
                      </div>
                      
                      {(!formData.image_url || formData.image_url.startsWith('data:image')) ? (
                        <ImagePreview
                          currentImageUrl={formData.image_url}
                          onImageChange={handleImageChange}
                          onImageRemove={handleImageRemove}
                          title=""
                          description="Upload an image for your project. This will be displayed when web preview is not available."
                          required={!formData.has_web_preview}
                          aspectRatio="16:9"
                          maxSize={5}
                          allowUrlInput={true}
                        />
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input
                              id="image_url"
                              type="url"
                              value={formData.image_url}
                              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter the URL of an image to display for this project
                            </p>
                          </div>
                          
                          {formData.image_url && (
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                              <img
                                src={formData.image_url}
                                alt="Project preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.url-fallback');
                                  if (fallback) {
                                    (fallback as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="url-fallback hidden w-full h-full items-center justify-center bg-muted">
                                <div className="text-center text-muted-foreground">
                                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Image unavailable</p>
                                  <p className="text-xs">Check the URL or try a different image</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                <div>
                  <Label>Technologies</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="Add technology"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    />
                    <Button type="button" onClick={addTechnology} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies?.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTechnology(index)}>
                        {tech} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {project.id ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Image Section */}
          <div className="relative">
            {project.image_url ? (
              <div className="aspect-video bg-muted overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectPreview(true);
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectPreview(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-t-lg md:rounded-l-lg md:rounded-t-none flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No Image</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="md:col-span-2 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {project.is_featured && (
                  <Badge variant="default" className="bg-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {project.has_web_preview && (
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    Web Preview
                  </Badge>
                )}
                {project.image_preview_enabled && !project.has_web_preview && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    Image Preview
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>

            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.technologies.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              {project.github_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    GitHub
                  </a>
                </Button>
              )}
              {project.has_web_preview && project.demo_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Live Demo
                  </a>
                </Button>
              )}
              {!project.has_web_preview && project.image_preview_enabled && project.image_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectPreview(true);
                  }}
                >
                  <ZoomIn className="h-3 w-3 mr-1" />
                  View Image
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProject(project)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeatured(project.id, !project.is_featured)}
                >
                  {project.is_featured ? (
                    <>
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Unfeature
                    </>
                  ) : (
                    <>
                      <Star className="h-3 w-3 mr-1" />
                      Feature
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteProject(project.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Projects Management</h2>
          <p className="text-muted-foreground">
            Manage your portfolio projects and showcase your work
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
                {category.id !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {projects.filter(p => p.category === category.id).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Projects Section */}
      {filteredFeaturedProjects.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600 fill-current" />
            Featured Projects ({filteredFeaturedProjects.length})
          </h3>
          <div className="space-y-4">
            {filteredFeaturedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Projects Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          All Projects ({filteredRegularProjects.length})
        </h3>
        {filteredRegularProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects found in this category</p>
              <p className="text-sm">Create your first project to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {currentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalProjects)} of {totalProjects} projects
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select value={projectsPerPage.toString()} onValueChange={(value) => {
                    setProjectsPerPage(parseInt(value));
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="Go to first page (Home key)"
                >
                  First
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  title="Previous page (← key)"
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                    // Show current page, first page, last page, and pages around current
                    const shouldShow = 
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      Math.abs(pageNum - currentPage) <= 1;
                    
                    if (shouldShow) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span key={pageNum} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                
                {/* Quick Jump to Page */}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Go to:</span>
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    className="w-16 h-8 text-center"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  title="Next page (→ key)"
                >
                  Next
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Go to last page (End key)"
                >
                  Last
                </Button>
              </div>
            </div>
            
            {/* Keyboard Shortcuts Info */}
            <div className="mt-3 pt-3 border-t border-muted text-xs text-muted-foreground text-center">
              💡 Keyboard shortcuts: ← → for navigation, Home/End for first/last page
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Project Form */}
      {(isCreating || editingProject) && (
        <ProjectForm
          project={editingProject || newProject}
          onSave={saveProject}
          onCancel={() => {
            setIsCreating(false);
            setEditingProject(null);
            setValidationErrors({});
          }}
        />
      )}

      {/* Project Image Preview Modal */}
      {showProjectPreview && selectedProject && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProjectPreview(false)}
                className="bg-black/50 text-white border-white/20 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedProject.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>
              
              <div className="p-4">
                <img
                  src={selectedProject.image_url}
                  alt={selectedProject.title}
                  className="w-full h-auto max-h-[70vh] object-contain rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}