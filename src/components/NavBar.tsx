import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Bot } from 'lucide-react';
import { useContentSections } from '@/hooks/useContentSections';

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeSections } = useContentSections();
  
  // Get settings section from active sections
  const settingsSection = activeSections.find(section => section.section_type === 'settings');
  const settings = settingsSection?.metadata || {};
  
  const brandName = settings.brandName || "Mushfiq's Bots";
  const logoUrl = settings.logoUrl || '';
  const links = settings.links || {};

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={brandName}
                className="w-8 h-8 rounded-full object-cover"
                style={{ width: '32px', height: '32px' }}
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
            <Bot className={`w-8 h-8 text-primary ${logoUrl ? 'hidden' : 'block'}`} />
            <span className="text-xl font-bold text-primary">{brandName}</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <Button 
              variant="neon" 
              size="sm"
              onClick={() => scrollToSection('#order')}
            >
              Order Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="px-4 pt-2">
                <Button 
                  variant="neon" 
                  size="sm" 
                  className="w-full"
                  onClick={() => scrollToSection('#order')}
                >
                  Order Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};