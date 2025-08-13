import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExternalLink, Star, Bot, TrendingUp, Globe, MessageCircle, Eye, Play, ShoppingCart } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";

interface ProjectWithReviews {
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
  review_count: number;
  five_star_count: number;
  average_rating: number;
}

export const PortfolioSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const sectionRef = useRef<HTMLDivElement>(null);
  const { projects: dbProjects, isLoading } = useProjects();

  // Modal states
  const [previewProject, setPreviewProject] = useState<ProjectWithReviews | null>(null);
  const [demoProject, setDemoProject] = useState<ProjectWithReviews | null>(null);
  const [orderProject, setOrderProject] = useState<ProjectWithReviews | null>(null);
  const [defaultTab, setDefaultTab] = useState<'telegram' | 'web'>('web');

  // Order form state
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    telegramUsername: '',
    projectRequirements: '',
    budgetRange: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Static fallback projects in case database is empty
  const fallbackProjects: ProjectWithReviews[] = [
    {
      id: "1",
      title: "E-commerce Telegram Bot",
      description: "Full-featured e-commerce bot with payment integration, inventory management, and customer support",
      category: "telegram",
      image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      technologies: ["Telegram API", "Payment Gateway", "Database", "Python"],
      github_url: "",
      demo_url: "https://t.me/ecommerce_bot_demo",
      is_featured: true,
      sort_order: 1,
      review_count: 0,
      five_star_count: 0,
      average_rating: 0
    },
    {
      id: "2",
      title: "Telegram Mini App Store",
      description: "Interactive shopping mini app within Telegram with seamless payment and user experience",
      category: "miniapp",
      image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      technologies: ["Telegram Mini App", "React.js", "Tailwind CSS", "Web App API"],
      github_url: "",
      demo_url: "https://t.me/miniapp_store_demo",
      is_featured: true,
      sort_order: 2,
      review_count: 0,
      five_star_count: 0,
      average_rating: 0
    },
    {
      id: "3",
      title: "Crypto Trading Bot",
      description: "Automated cryptocurrency trading bot with advanced algorithms and risk management",
      category: "trading",
      image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop",
      technologies: ["Python", "Binance API", "MongoDB", "AI"],
      github_url: "",
      demo_url: "https://t.me/crypto_trading_bot",
      is_featured: true,
      sort_order: 3,
      review_count: 0,
      five_star_count: 0,
      average_rating: 0
    },
    {
      id: "4",
      title: "React Portfolio Dashboard",
      description: "Modern portfolio dashboard built with React.js and Tailwind CSS for client management",
      category: "react",
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      technologies: ["React.js", "Tailwind CSS", "TypeScript", "API"],
      github_url: "",
      demo_url: "https://portfolio-dashboard-demo.vercel.app",
      is_featured: false,
      sort_order: 4,
      review_count: 0,
      five_star_count: 0,
      average_rating: 0
    },
    {
      id: "5",
      title: "Discord Community Manager",
      description: "Advanced Discord bot for community management with moderation and engagement features",
      category: "discord",
      image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      technologies: ["Discord.js", "Node.js", "PostgreSQL", "Redis"],
      github_url: "",
      demo_url: "https://discord.gg/community-manager",
      is_featured: false,
      sort_order: 5,
      review_count: 0,
      five_star_count: 0,
      average_rating: 0
    },
    {
      id: "6",
      title: "Web Scraping Automation",
      description: "Intelligent web scraping solution for real-time data collection and monitoring",
      category: "scraping",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      technologies: ["Python", "Selenium", "BeautifulSoup", "API"],
      github_url: "",
      demo_url: "https://web-scraping-demo.vercel.app",
      is_featured: false,
      sort_order: 6,
      review_count: 0,
      five_star_count: 0,
      average_rating: 0
    }
  ];

  // Use database projects if available, otherwise use fallback
  const projects = dbProjects.length > 0 ? dbProjects : fallbackProjects;

  // Filter projects to show only featured ones
  const featuredProjects = projects.filter(project => project.is_featured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects;

  // Filter projects based on active filter
  const filteredProjects = activeFilter === "all" 
    ? displayProjects 
    : displayProjects.filter(project => project.category === activeFilter);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'telegram':
        return Bot;
      case 'miniapp':
        return Bot;
      case 'discord':
        return Bot;
      case 'trading':
        return TrendingUp;
      case 'react':
        return Globe;
      case 'scraping':
        return Globe;
      default:
        return Bot;
    }
  };

  const filters = [
    { id: "all", label: "All Projects" },
    { id: "telegram", label: "Telegram Bots" },
    { id: "miniapp", label: "Mini Apps" },
    { id: "react", label: "React.js" },
    { id: "discord", label: "Discord Bots" },
    { id: "trading", label: "Trading Bots" },
    { id: "scraping", label: "Web Scraping" },
    { id: "ai", label: "AI Bots" },
    { id: "automation", label: "Automation" }
  ];

  const isTelegramLike = (project: ProjectWithReviews | null | undefined) => {
    const cat = (project?.category || '').toLowerCase();
    return cat.includes('telegram') || cat.includes('miniapp');
  };

  const openPreview = (project: ProjectWithReviews) => {
    setPreviewProject(project);
    setDefaultTab(isTelegramLike(project) ? 'telegram' : 'web');
  };

  const openDemo = (project: ProjectWithReviews) => {
    setDemoProject(project);
  };

  const openOrder = (project: ProjectWithReviews) => {
    setOrderProject(project);
    // Reset form when opening order modal
    setOrderForm({
      customerName: '',
      customerEmail: '',
      telegramUsername: '',
      projectRequirements: '',
      budgetRange: '',
      timeline: ''
    });
  };

  const closePreview = () => {
    setPreviewProject(null);
  };

  const closeDemo = () => {
    setDemoProject(null);
  };

  const closeOrder = () => {
    setOrderProject(null);
  };

  // Enhanced URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Enhanced Telegram username extraction
  const extractTelegramUsername = (url: string | undefined | null): string | null => {
    if (!url) return null;
    
    // Handle various Telegram URL formats
    const telegramPatterns = [
      /t\.me\/([a-zA-Z0-9_]+)/,
      /telegram\.me\/([a-zA-Z0-9_]+)/,
      /@([a-zA-Z0-9_]+)/,
      /^([a-zA-Z0-9_]+)$/
    ];
    
    for (const pattern of telegramPatterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  // Enhanced project type detection
  const getProjectType = (project: ProjectWithReviews): 'telegram' | 'web' | 'mobile' | 'desktop' => {
    if (!project.demo_url) return 'web';
    
    const url = project.demo_url.toLowerCase();
    if (url.includes('t.me') || url.includes('telegram')) return 'telegram';
    if (url.includes('play.google') || url.includes('apps.apple')) return 'mobile';
    if (url.includes('.exe') || url.includes('github.com')) return 'desktop';
    return 'web';
  };

  const renderPreviewBody = (project: ProjectWithReviews) => {
    if (!project) {
      return (
        <div className="text-sm text-muted-foreground">No project selected for preview.</div>
      );
    }

    const projectType = getProjectType(project);
    const username = extractTelegramUsername(project?.demo_url || '');
    const isWebDemo = project?.demo_url && !/t\.me|telegram/i.test(project.demo_url);
    const isValidDemoUrl = project.demo_url && isValidUrl(project.demo_url);

    return (
      <div className="space-y-6">
        {/* Project Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Technologies:</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Tabs */}
        <Tabs defaultValue={isTelegramLike(project) ? defaultTab : (isWebDemo ? 'web' : 'telegram')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="web">Web</TabsTrigger>
          </TabsList>
          
          <TabsContent value="telegram" className="space-y-4 mt-4">
            {username ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Open the bot directly in Telegram without leaving this page:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="neon">
                    <a href={`tg://resolve?domain=${username}`}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Open in Telegram App
                    </a>
                  </Button>
                  <Button asChild variant="glow">
                    <a href={`https://t.me/${username}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open in Telegram Web
                    </a>
                  </Button>
                </div>
                <p className="text-xs">
                  Note: Telegram does not allow full in-page embedding for security reasons. Use the buttons above to preview.
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p className="text-red-500 mb-2">⚠️ Telegram preview link is not configured for this project.</p>
                <p>Please add a valid Telegram bot URL in the admin panel.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="web" className="space-y-4 mt-4">
            {isWebDemo && isValidDemoUrl ? (
              <div className="space-y-3">
                <div className="rounded-lg overflow-hidden border border-muted bg-card/50">
                  <iframe
                    src={project.demo_url}
                    title="Web Preview"
                    className="w-full h-[400px]"
                    onError={() => {
                      // Failed to load iframe
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={project.demo_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {!project.demo_url ? (
                  <p className="text-red-500">⚠️ No demo URL configured for this project.</p>
                ) : !isValidDemoUrl ? (
                  <p className="text-red-500">⚠️ Invalid demo URL format.</p>
                ) : (
                  <p>Web preview is not available for this project type.</p>
                )}
                <p className="mt-2">Please configure a valid demo URL in the admin panel.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderDemoBody = (project: ProjectWithReviews) => {
    if (!project) return null;

    const projectType = getProjectType(project);
    const isTelegramDemo = /t\.me|telegram/i.test(project.demo_url || '');
    const username = extractTelegramUsername(project.demo_url);
    const isValidDemoUrl = project.demo_url && isValidUrl(project.demo_url);

    return (
      <div className="space-y-6">
        {/* Project Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">{projectType}</Badge>
            {project.is_featured && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="w-3 h-3 mr-1" /> Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Demo Actions */}
        <div className="space-y-4">
          {isTelegramDemo && username ? (
            <div className="space-y-3">
              <h4 className="font-medium">Telegram Bot Demo</h4>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="neon" size="lg">
                  <a href={`tg://resolve?domain=${username}`}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Open Bot in Telegram
                  </a>
                </Button>
                <Button asChild variant="glow" size="lg">
                  <a href={`https://t.me/${username}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> Open in Browser
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the button above to start chatting with the bot directly in Telegram.
              </p>
            </div>
          ) : isValidDemoUrl ? (
            <div className="space-y-3">
              <h4 className="font-medium">Web Demo</h4>
              <Button asChild variant="neon" size="lg" className="w-full">
                <a href={project.demo_url} target="_blank" rel="noreferrer">
                  <Globe className="w-4 h-4 mr-2" /> Launch Demo
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                Click the button above to open the live demo in a new tab.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-sm text-muted-foreground">
                {!project.demo_url 
                  ? 'No demo available for this project.'
                  : 'Invalid demo URL format.'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please contact the administrator to configure a demo.
              </p>
            </div>
          )}
        </div>

        {/* Additional Links */}
        {(project.github_url || project.demo_url) && (
          <div className="space-y-3">
            <h4 className="font-medium">Additional Links</h4>
            <div className="flex flex-wrap gap-2">
              {project.github_url && (
                <Button asChild variant="outline" size="sm">
                  <a href={project.github_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> GitHub
                  </a>
                </Button>
              )}
              {isValidDemoUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={project.demo_url} target="_blank" rel="noreferrer">
                    <Play className="w-4 h-4 mr-2" /> Live Demo
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrderBody = (project: ProjectWithReviews) => {
    if (!project) return null;

    const handleInputChange = (field: string, value: string) => {
      setOrderForm(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <div className="space-y-6">
        {/* Order Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Order Details</h3>
          <p className="text-sm text-muted-foreground">
            Project: <span className="font-medium">{project.title}</span>
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name *</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-muted rounded-md bg-background"
                placeholder="Enter your full name"
                value={orderForm.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-muted rounded-md bg-background"
                placeholder="Enter your email"
                value={orderForm.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telegram Username</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-muted rounded-md bg-background"
                placeholder="@username or t.me/username"
                value={orderForm.telegramUsername}
                onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Requirements *</label>
              <textarea 
                className="w-full px-3 py-2 border border-muted rounded-md bg-background h-24"
                placeholder="Describe your project requirements..."
                value={orderForm.projectRequirements}
                onChange={(e) => handleInputChange('projectRequirements', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Budget Range</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-muted rounded-md bg-background"
                placeholder="e.g., $1000 - $5000"
                value={orderForm.budgetRange}
                onChange={(e) => handleInputChange('budgetRange', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timeline</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-muted rounded-md bg-background"
                placeholder="e.g., 2-3 weeks"
                value={orderForm.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setOrderProject(null)}>
              Cancel
            </Button>
            <Button 
              variant="neon" 
              className="flex-1"
              onClick={() => handleSubmitOrder(project)}
              disabled={isSubmitting}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Order submission handler
  const handleSubmitOrder = async (project: ProjectWithReviews) => {
    if (!orderForm.customerName || !orderForm.customerEmail || !orderForm.projectRequirements) {
      alert('Please fill in all required fields (Name, Email, and Requirements)');
      return;
    }

    if (!project) return;

    setIsSubmitting(true);
    
    try {
      
      // Prepare order data according to the database schema
      const orderData = {
        customer_name: orderForm.customerName,
        customer_email: orderForm.customerEmail,
        customer_telegram: orderForm.telegramUsername || null,
        project_description: orderForm.projectRequirements,
        service_type: project.title, // Add the missing service_type field
        budget_range: orderForm.budgetRange || 'To be discussed',
        timeline: orderForm.timeline || 'To be discussed',
        status: 'pending'
      };

      
      // Insert order into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      
      if (error) {
        alert(`Failed to submit order: ${error.message}`);
        return;
      }

      
      // Show success message
      alert('Order submitted successfully! We will contact you soon.');
      
      // Reset form and close modal
      setOrderForm({
        customerName: '',
        customerEmail: '',
        telegramUsername: '',
        projectRequirements: '',
        budgetRange: '',
        timeline: ''
      });
      setOrderProject(null);
      
    } catch (error) {
      alert(`Failed to submit order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="portfolio"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
              Featured <span className="text-primary">Projects</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Showcasing successful bot development projects that have delivered real value to clients
            </p>
            
            
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "neon" : "glow"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="transition-all duration-300"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading state
              [...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProjects.length === 0 ? (
              // No projects state
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">
                  <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                  <p className="mb-4">
                    {dbProjects.length === 0 
                      ? "No projects have been created yet. Please add some projects through the admin panel."
                      : "No projects match the current filter. Try selecting a different category."
                    }
                  </p>
                  
                  
                </div>
              </div>
            ) : (
              filteredProjects.map((project, index) => {
                const Icon = getIconForCategory(project.category);
                
                
                return (
                  <Card 
                    key={project.id}
                    className={`group hover:shadow-neon transition-all duration-500 bg-card/50 backdrop-blur-sm border-muted hover:scale-105 cursor-pointer ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <CardContent className="p-6">
                      {/* Project Image */}
                      {project.image_url && (
                        <div className="mb-4 relative">
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            {/* Check if base64 string is too long */}
                            {project.image_url.startsWith('data:image') && project.image_url.length > 1000000 ? (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <div className="text-center text-muted-foreground">
                                  <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Image too large</p>
                                  <p className="text-xs">Please optimize in admin panel</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={project.image_url}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  // Hide image on error and show fallback
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.image-fallback');
                                  if (fallback) {
                                    (fallback as HTMLElement).style.display = 'flex';
                                  }
                                }}
                                onLoad={() => {
                                  // Image loaded successfully
                                }}
                              />
                            )}
                            {/* Fallback when image fails to load */}
                            <div className="image-fallback hidden w-full h-full items-center justify-center bg-muted">
                              <div className="text-center text-muted-foreground">
                                <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Image unavailable</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-1">
                          {project.review_count > 0 ? (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < Math.round(project.average_rating) 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                              <span className="text-sm text-muted-foreground ml-1">
                                review ({project.review_count})
                              </span>
                              {project.five_star_count > 0 && (
                                <span className="text-xs text-primary ml-2">
                                  {project.five_star_count} 5★
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No reviews yet
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl font-bold mb-3 text-primary group-hover:text-primary-glow transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 text-sm">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies?.map((tech: string, techIndex: number) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Buttons: Preview + Demo + Order */}
                      <div className="flex gap-2 relative z-10">
                        <Button 
                          variant="neon"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openPreview(project);
                          }}
                          className="flex-1 relative z-20 cursor-pointer"
                          style={{ position: 'relative', zIndex: 20 }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          variant="glow"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDemo(project);
                          }}
                          className="flex-1 relative z-20 cursor-pointer"
                          style={{ position: 'relative', zIndex: 20 }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Demo
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openOrder(project);
                          }}
                          className="flex-1 relative z-20 cursor-pointer"
                          style={{ position: 'relative', zIndex: 20 }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Order
                        </Button>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none" style={{ zIndex: 1 }} />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Bottom Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold text-primary text-glow">{displayProjects.length}+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary text-purple-glow">100%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary text-glow">24/7</div>
                <div className="text-sm text-muted-foreground">Bot Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary text-purple-glow">5⭐</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewProject && (
        <div 
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
          onClick={() => setPreviewProject(null)}
        >
          <div 
            className="bg-background p-6 rounded-lg max-w-3xl w-full border border-primary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Project Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Preview the bot in Telegram or view the web demo (if available).
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPreviewProject(null)}
              >
                ✕
              </Button>
            </div>
            {renderPreviewBody(previewProject)}
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {demoProject && (
        <div 
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
          onClick={() => setDemoProject(null)}
        >
          <div 
            className="bg-background p-6 rounded-lg max-w-2xl w-full border border-primary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Project Demo</h2>
                <p className="text-sm text-muted-foreground">
                  View the project demo and experience its functionality.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDemoProject(null)}
              >
                ✕
              </Button>
            </div>
            {renderDemoBody(demoProject)}
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderProject && (
        <div 
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
          onClick={() => setOrderProject(null)}
        >
          <div 
            className="bg-background p-6 rounded-lg max-w-2xl w-full border border-primary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Place Order</h2>
                <p className="text-sm text-muted-foreground">
                  Order a similar project or customize this one for your needs.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setOrderProject(null)}
              >
                ✕
              </Button>
            </div>
            {renderOrderBody(orderProject)}
          </div>
        </div>
      )}
    </section>
  );
};