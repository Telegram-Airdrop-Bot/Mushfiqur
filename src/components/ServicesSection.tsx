import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, TrendingUp, Globe, Zap, Cog } from "lucide-react";
import { useContentSections } from "@/hooks/useContentSections";

export const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { activeSections } = useContentSections();
  
  // Get services section from active sections
  const servicesSection = activeSections.find(section => section.section_type === 'services');
  const servicesMeta = servicesSection?.metadata || {};
  
  // Debug: Log when content changes
  useEffect(() => {
    console.log('🎯 ServicesSection: Content updated!', {
      servicesSection,
      servicesMeta
    });
  }, [servicesSection, servicesMeta]);

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

  const iconMap: Record<string, any> = { bot: Bot, msg: MessageSquare, up: TrendingUp, globe: Globe, zap: Zap, cog: Cog };
  const defaultServices = [
    { icon: 'bot', title: 'Telegram & Discord Bots', description: 'Custom bots with payment integration, user management, and advanced features', features: ['Payment Processing','User Authentication','Custom Commands','Database Integration'], color: 'primary' },
    { icon: 'msg', title: 'Telegram Mini Apps', description: 'Interactive web applications that run seamlessly within Telegram interface', features: ['Web App Integration','Telegram Payments','User Data Access','Cross-Platform'], color: 'secondary' },
    { icon: 'up', title: 'Auto Trading Bots', description: 'Automated trading solutions with risk management and real-time monitoring', features: ['Market Analysis','Risk Management','Real-time Alerts','Portfolio Tracking'], color: 'primary' },
    { icon: 'globe', title: 'Web Automation & Scraping', description: 'Intelligent web scraping and automation for data collection and processing', features: ['Data Extraction','Content Monitoring','Price Tracking','Report Generation'], color: 'secondary' },
    { icon: 'zap', title: 'API Integration Bots', description: 'Seamless integration with third-party APIs and custom workflow automation', features: ['REST API Integration','Webhook Handling','Data Synchronization','Custom Workflows'], color: 'primary' },
    { icon: 'cog', title: 'React.js Web Applications', description: 'Modern, responsive web applications built with React.js and Tailwind CSS', features: ['Responsive Design','Component Architecture','State Management','Modern UI/UX'], color: 'secondary' },
  ];
  const services = (servicesMeta?.items || defaultServices).map((s: any) => ({
    ...s,
    IconCmp: iconMap[(s.icon || '').toLowerCase?.() || s.icon] || Bot,
  }));

  return (
    <section 
      id="services"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
              My <span className="text-primary">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive bot development and automation solutions tailored to your business needs
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any, index: number) => {
              const Icon = service.IconCmp;
              const isPrimary = service.color === "primary";
              
              return (
                <Card 
                  key={index}
                  className={`group hover:shadow-${isPrimary ? 'neon' : 'purple'} transition-all duration-500 bg-card/50 backdrop-blur-sm border-muted hover:scale-105 cursor-pointer ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <CardContent className="p-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-lg bg-gradient-${isPrimary ? 'primary' : 'to-r from-secondary to-accent'} flex items-center justify-center mb-6 group-hover:animate-pulse-glow`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className={`text-xl font-bold mb-3 ${isPrimary ? 'text-primary' : 'text-secondary'}`}>
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2">
                      {service.features.map((feature: string, featureIndex: number) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full bg-${isPrimary ? 'primary' : 'secondary'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Hover effect overlay */}
                    <div className={`absolute inset-0 bg-gradient-${isPrimary ? 'primary' : 'to-r from-secondary to-accent'} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg`} />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-lg text-muted-foreground mb-6">
              Need a custom solution? Let's discuss your project requirements.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <span className="text-primary font-semibold">💬 Free Consultation Available</span>
              </button>
              <button 
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-secondary/10 border border-secondary/20 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer"
              >
                <span className="text-secondary font-semibold">⚡ View Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};