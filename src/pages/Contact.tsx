import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Clock, MapPin, Send, Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const Contact = () => {
  const { t, direction } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const contactSchema = z.object({
    name: z.string().trim().min(1, t('contact.error.nameRequired')).max(100),
    email: z.string().trim().email(t('contact.error.invalidEmail')),
    subject: z.string().trim().min(1, t('contact.error.subjectRequired')).max(200),
    message: z.string().trim().min(10, t('contact.error.messageTooShort')).max(2000),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) fieldErrors[error.path[0] as string] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    // Simulate sending (can be connected to an edge function later)
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: t('contact.success.title'),
      description: t('contact.success.message'),
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsLoading(false);
  };

  const infoItems = [
    {
      icon: Mail,
      label: t('contact.info.email'),
      value: 'contact@livreuradm.ma',
      href: 'mailto:contact@livreuradm.ma',
    },
    {
      icon: MessageCircle,
      label: t('contact.info.whatsapp'),
      value: '+212 6XX XXX XXX',
      href: 'https://wa.me/212600000000',
    },
    {
      icon: Clock,
      label: t('contact.info.hours'),
      value: t('contact.info.hoursValue'),
    },
    {
      icon: MapPin,
      label: t('contact.info.address'),
      value: t('contact.info.addressValue'),
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('contact.back')}
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {t('contact.title')}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <Card className="lg:col-span-3 border-border/50">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.name')}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('contact.namePlaceholder')}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t('contact.emailPlaceholder')}
                          className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.subject')}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t('contact.subjectPlaceholder')}
                      className={errors.subject ? 'border-destructive' : ''}
                    />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.message')}</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('contact.messagePlaceholder')}
                      className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${errors.message ? 'border-destructive' : 'border-input'}`}
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('contact.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t('contact.send')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t('contact.info.title')}
              </h2>
              {infoItems.map((item, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground font-medium hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-foreground font-medium">{item.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
