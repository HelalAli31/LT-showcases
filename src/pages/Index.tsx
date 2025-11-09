import { LanguageProvider } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Values } from '@/components/Values';
import { Portfolio } from '@/components/Portfolio';
import { Contact } from '@/components/Contact';
import { WhatsAppFAB } from '@/components/WhatsAppFAB';
import { Footer } from '@/components/Footer';
import {TeamSection} from "@/components/TeamSection";
const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Hero />
          <About />
          <Values />
          <Portfolio />
            <TeamSection />
          <Contact />
        </main>
        <Footer />
        <WhatsAppFAB />
      </div>
    </LanguageProvider>
  );
};

export default Index;
