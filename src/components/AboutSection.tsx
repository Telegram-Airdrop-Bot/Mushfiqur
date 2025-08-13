import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Database, Bot, Zap, Globe, Cpu, CheckCircle2, Rocket, Shield, TrendingUp, PhoneCall } from "lucide-react";
import { useContentSections } from "@/hooks/useContentSections";

export const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { activeSections } = useContentSections();
  
  // Get about section from active sections
  const aboutSection = activeSections.find(section => section.section_type === 'about');
  const aboutMeta = aboutSection?.metadata || {};
  
  const aboutCopy = aboutMeta.copy || aboutMeta.aboutCopy || "I'm a bot automation expert specializing in creating intelligent solutions that streamline workflows, enhance user experiences, and drive business growth through cutting-edge automation technology.";
  const skillsFromMeta: Array<{ name: string; level: number; icon?: string; color?: string }> = aboutMeta.skills || [];

  // Debug: Log when content changes
  useEffect(() => {
    console.log('🎯 AboutSection: Content updated!', {
      aboutSection,
      aboutMeta,
      aboutCopy,
      skillsFromMeta
    });
  }, [aboutSection, aboutMeta, aboutCopy, skillsFromMeta]);

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

  const iconMap: Record<string, any> = { bot: Bot, code: Code, zap: Zap, globe: Globe, db: Database, cpu: Cpu };
  const skills = (skillsFromMeta.length ? skillsFromMeta : [
    { name: "Telegram API", level: 97, icon: 'bot', color: "text-primary" },
    { name: "React.js/JavaScript", level: 95, icon: 'code', color: "text-secondary" },
    { name: "Python Development", level: 95, icon: 'code', color: "text-primary" },
    { name: "Tailwind CSS", level: 94, icon: 'zap', color: "text-secondary" },
    { name: "Web Scraping", level: 94, icon: 'globe', color: "text-primary" },
    { name: "Database Integration", level: 94, icon: 'db', color: "text-secondary" },
    { name: "AI Bot Development", level: 96, icon: 'cpu', color: "text-primary" },
    { name: "API Integration", level: 94, icon: 'zap', color: "text-secondary" }
  ]).map(s => ({
    ...s,
    IconCmp: iconMap[(s.icon || '').toLowerCase?.() || s.icon] || Bot
  }));

  const timeline = [
    { year: "2022", title: "Started Bot Development", desc: "First Telegram bot project" },
    { year: "2023", title: "Fiverr Success", desc: "Achieved Level 2 Seller status" },
    { year: "2024", title: "30+ Projects", desc: "Expanding to enterprise clients" }
  ];

  return (
    <section 
      id="about"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-secondary rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
              About <span className="text-primary">Md Moshfiqur Rahaman</span>
            </h2>
            <div className="mx-auto max-w-3xl">
              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 shadow-soft">
                <p className="text-lg md:text-[18px] leading-8 tracking-tight font-medium text-muted-foreground">{aboutCopy}</p>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { icon: CheckCircle2, label: 'Workflow Automation' },
                { icon: Shield, label: 'Secure & Reliable' },
                { icon: TrendingUp, label: 'Business Impact' },
                { icon: Rocket, label: 'Rapid Delivery' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-background/40 border border-muted hover:border-primary/30 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button 
                variant="neon"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="group"
              >
                <PhoneCall className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Get Free Consultation
              </Button>
              <Button 
                variant="glow"
                onClick={() => window.open('https://fiverr.com', '_blank')}
                className="group"
              >
                <Rocket className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Hire Me on Fiverr
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Timeline */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-primary">My Journey</h3>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-4 transition-all duration-500 ${
                      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-neon">
                      {item.year.slice(-2)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-secondary">Technical Skills</h3>
              <div className="space-y-6">
                {skills.map((skill: any, index: number) => {
                  const Icon = skill.IconCmp;
                  return (
                    <div 
                      key={skill.name}
                      className={`transition-all duration-700 ${
                        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'
                      }`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${skill.color}`} />
                          <span className="font-medium">{skill.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            skill.color.includes('primary') ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-gradient-to-r from-secondary to-accent'
                          }`}
                          style={{ 
                            width: isVisible ? `${skill.level}%` : '0%',
                            transitionDelay: `${index * 150 + 300}ms`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Certifications/Badges */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold mb-6">Expertise Areas</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {["Telegram Bots", "Telegram Mini Apps", "Discord Bots", "React.js", "Tailwind CSS", "Web Scraping", "API Integration", "Auto Trading", "AI Chatbots", "Workflow Automation", "Database Management"].map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="px-4 py-2 text-sm hover:shadow-purple transition-all duration-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};