import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, Zap, Clock, Shield, Star } from "lucide-react";
import { toast } from "sonner";
import { useContentSections } from "@/hooks/useContentSections";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    message: ''
  });
  const { toast } = useToast();
  const { activeSections } = useContentSections();
  
  // Get settings section from active sections
  const settingsSection = activeSections.find(section => section.section_type === 'settings');
  const settings = settingsSection?.metadata || {};
  
  // Debug: Log when content changes
  useEffect(() => {
    console.log('🎯 ContactSection: Content updated!', {
      settingsSection,
      settings
    });
  }, [settingsSection, settings]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const links = settings.links || {};
  const telegramUrl = links.telegramUrl || 'https://t.me/mushfiqmoon';
  const email = links.email || 'moonbd01717@gmail.com';
  const linkedin = links.linkedin || 'https://www.linkedin.com/in/md-moshfiqur-rahman-951039232/';
  const fiverrUrl = links.fiverrUrl || 'https://fiverr.com';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Save contact message to database
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          project: formData.project,
          message: formData.message,
          status: 'unread',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Message sent successfully!",
        description: "I'll get back to you within 24 hours. Thanks for reaching out!",
        variant: "default"
      });
      
      // Reset form
      setFormData({ name: "", email: "", project: "", message: "" });
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again. You can also contact me directly via Telegram or email.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <section 
        id="contact"
        ref={sectionRef}
        className="py-20 bg-gradient-to-b from-background to-muted/20 relative"
      >
        <div className="container mx-auto px-4">
          <div className={`transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
                Let's <span className="text-primary">Work Together</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Ready to automate your business processes? Get in touch for a free consultation and project quote.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="bg-card/50 backdrop-blur-sm border-muted shadow-soft">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-primary">Send Me a Message</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required
                          className="bg-background/50 border-muted focus:border-primary focus:shadow-neon transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          required
                          className="bg-background/50 border-muted focus:border-primary focus:shadow-neon transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Type</label>
                      <Input
                        name="project"
                        value={formData.project}
                        onChange={handleInputChange}
                        placeholder="e.g., Telegram Bot, Web Scraping, Discord Bot"
                        className="bg-background/50 border-muted focus:border-primary focus:shadow-neon transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Details *</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Describe your project requirements, goals, and any specific features you need..."
                        rows={6}
                        required
                        className="bg-background/50 border-muted focus:border-primary focus:shadow-neon transition-all duration-300 resize-none"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-neon flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info & CTAs */}
              <div className="space-y-8">
                {/* Quick Contact */}
                <Card className="bg-gradient-primary text-white shadow-neon">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 animate-float" />
                    <h3 className="text-2xl font-bold mb-4">Need Quick Support?</h3>
                    <p className="mb-6 opacity-90">
                      Get instant answers to your questions via Telegram
                    </p>
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full group"
                      onClick={() => window.open(telegramUrl, '_blank')}
                    >
                      <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                      Chat on Telegram
                    </Button>
                  </CardContent>
                </Card>

                {/* Fiverr CTA */}
                <Card className="bg-card/50 backdrop-blur-sm border-muted shadow-soft">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Hire Me on Fiverr</h3>
                    <p className="text-muted-foreground mb-6">
                      Browse my services and get started with confidence
                    </p>
                    <Button 
                      variant="neon" 
                      className="w-full"
                      onClick={() => window.open(fiverrUrl, '_blank')}
                    >
                      View Fiverr Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Why Choose Me */}
                <Card className="bg-card/50 backdrop-blur-sm border-muted shadow-soft">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-6 text-secondary">Why Choose Me?</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-sm">24-48 hour delivery on most projects</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-sm">100% money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-primary" />
                        <span className="text-sm">5-star rating with 50+ reviews</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm">Free consultation & ongoing support</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="neon"
          size="icon"
          className="rounded-full w-14 h-14 shadow-neon animate-pulse-glow"
          onClick={() => window.open(telegramUrl, '_blank')}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
};