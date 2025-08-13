import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Bot, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import botAvatar from "@/assets/bot-avatar.png";
import { useContentSections } from "@/hooks/useContentSections";

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { activeSections } = useContentSections();
  
  // Get hero and settings sections from active sections
  const heroSection = activeSections.find(section => section.section_type === 'hero');
  const settingsSection = activeSections.find(section => section.section_type === 'settings');
  
  // Extract metadata with fallbacks
  const heroMeta = heroSection?.metadata || {};
  const settings = settingsSection?.metadata || {};
  
  const headline = heroMeta.headline || 'I Build Bots That';
  const subheadline = heroMeta.subheadline || 'Telegram, Discord, Web Automation & More |';
  const stats = heroMeta.stats || { years: '2+', projects: '30+', rating: '5⭐' };
  const ctas = heroMeta.ctas || {};
  const fiverrUrl = ctas.fiverrUrl || settings?.links?.fiverrUrl || 'https://fiverr.com';
  const logoUrl = settings.logoUrl || '';

  // Debug: Log when content changes
  useEffect(() => {
    console.log('🎯 HeroSection: Content updated!', {
      heroSection,
      settingsSection,
      heroMeta,
      settings
    });
  }, [heroSection, settingsSection, heroMeta, settings]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden matrix-bg"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Bot Avatar */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-32 h-32 animate-float shadow-neon object-contain"
                  style={{ width: '128px', height: '128px' }}
                  onError={(e) => {
                    // Fallback to bot avatar if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling;
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'block';
                    }
                  }}
                />
              ) : null}
              <img 
                src={botAvatar} 
                alt="Bot Avatar" 
                className={`w-32 h-32 animate-float shadow-neon rounded-full ${logoUrl ? 'hidden' : 'block'}`}
              />
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-primary rounded-full animate-pulse-glow flex items-center justify-center">
                  <Bot className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-glow">
            {headline}
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {heroMeta.highlight || 'Automate Success'}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {subheadline}
            <span className="text-primary font-semibold"> {stats?.projects || '30+'} Projects Delivered</span>
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary text-glow">{stats?.years || '2+'}</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary text-purple-glow">{stats?.projects || '30+'}</div>
              <div className="text-sm text-muted-foreground">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary text-glow">{stats?.rating || '5⭐'}</div>
              <div className="text-sm text-muted-foreground">Fiverr Rating</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              variant="neon" 
              size="lg"
              className="group"
              onClick={() => window.open(fiverrUrl, '_blank')}
            >
              <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Hire Me on Fiverr
            </Button>
            <Button 
              variant="glow" 
              size="lg"
              className="group"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Bot className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Get Free Consultation
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce"
          onClick={scrollToNext}
        >
          <ChevronDown className="w-8 h-8 text-primary" />
        </div>
      </div>
    </section>
  );
};