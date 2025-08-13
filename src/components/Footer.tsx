import { Bot, Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import { useContentSections } from "@/hooks/useContentSections";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { activeSections } = useContentSections();
  
  // Get settings section from active sections
  const settingsSection = activeSections.find(section => section.section_type === 'settings');
  const settings = settingsSection?.metadata || {};
  
  const brandName = settings.brandName || 'Md Moshfiqur Rahaman';
  const logoUrl = settings.logoUrl || '';
  const links = settings.links || {};
  const telegramUrl = links.telegramUrl || 'https://t.me/mushfiqmoon';
  const email = links.email || 'moonbd01717@gmail.com';
  const linkedin = links.linkedin || 'https://www.linkedin.com/in/md-moshfiqur-rahman-951039232/';
  const facebook = links.facebook || 'https://www.facebook.com/mushfiqr.moon';

  return (
    <footer className="bg-background border-t border-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={brandName}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ width: '40px', height: '40px' }}
                  onError={(e) => {
                    // Fallback to Bot icon if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling;
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'block';
                    }
                  }}
                />
              ) : null}
              {!logoUrl && (
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-primary">{brandName}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Bot Developer & Automation Expert
              <br />
              Transforming businesses through intelligent automation
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <div>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Me
                </a>
              </div>
              <div>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  Services
                </a>
              </div>
              <div>
                <a href="#portfolio" className="text-muted-foreground hover:text-primary transition-colors">
                  Portfolio
                </a>
              </div>
              <div>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-secondary">Connect With Me</h3>
            <div className="flex justify-center md:justify-start gap-4">
              <a 
                href={telegramUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-neon"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href={`mailto:${email}`}
                className="w-10 h-10 bg-primary/10 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-neon"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href={linkedin}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-neon"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href={facebook}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-neon"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Available for new projects</p>
              <p className="text-primary">Response time: &lt; 24 hours</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-muted mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {brandName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Available for work
              </span>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};