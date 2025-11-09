import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WhatsAppFAB = () => {
  const { t } = useLanguage();

  const whatsappNumber = '+972549598571';
  const whatsappMessage = encodeURIComponent(t('whatsapp.message'));
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const handleClick = () => {
    // Track click analytics (placeholder)
    console.log('WhatsApp FAB clicked');
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="fixed bottom-8 ltr:right-8 rtl:left-8 z-50 w-16 h-16 rounded-full bg-accent hover:bg-accent/90 shadow-lg hover-glow flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label={t('whatsapp.tooltip')}
          >
            <MessageCircle className="text-accent-foreground" size={28} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card text-foreground border-border">
          <p>{t('whatsapp.tooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
