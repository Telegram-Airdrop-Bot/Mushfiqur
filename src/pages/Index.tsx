import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { OrderSection } from "@/components/OrderSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingChatButton } from "@/components/FloatingChatButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <ReviewsSection />
      <OrderSection />
      <ContactSection />
      <Footer />
      
      {/* Floating Telegram Chat Button */}
      <FloatingChatButton 
        botUsername="mushfiqmoon" 
        adminName="Mushfiq" 
      />
    </div>
  );
};

export default Index;