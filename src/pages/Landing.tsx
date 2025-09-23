import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Brain,
  Calendar,
  Shield,
  TrendingUp,
  Sparkles,
  Leaf,
  Heart,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-ayurveda.jpg';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Guided Precautions",
      description: "Get personalized therapy recommendations and precautions powered by advanced AI."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Seamlessly book and manage Panchakarma therapy sessions with intelligent scheduling."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your healing journey with detailed analytics and progress visualization."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Your health data is protected with enterprise-grade security and HIPAA compliance."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <img src="/Ayursutra.png" alt="AyurSutra Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              <span className="text-xl sm:text-2xl font-bold text-primary">AyurSutra</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex space-x-2 sm:space-x-4"
            >
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
                className="border-primary/20 hover:bg-primary/5 hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/auth')}
                className="bg-gradient-primary hover:opacity-90"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-primary">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
                    AI-Powered Healthcare
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  AI-Powered{' '}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Panchakarma
                  </span>{' '}
                  Therapy Management
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Seamlessly schedule therapies, get AI-guided precautions, and track 
                  recovery in real-time with AyurSutra's modern healthcare platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth?type=patient')}
                  className="bg-gradient-primary hover:opacity-90 shadow-wellness w-full sm:w-auto"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Login as Patient
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/auth?type=practitioner')}
                  className="border-primary/30 hover:bg-primary/5 w-full sm:w-auto"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Login as Practitioner
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Patients Treated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">50+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Practitioners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">98%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative order-first lg:order-last"
            >
              <div className="relative z-10">
                <img 
                  src={heroImage} 
                  alt="Ayurveda wellness and healing" 
                  className="rounded-2xl shadow-2xl animate-float w-full h-64 sm:h-80 lg:h-auto object-cover"
                />
              </div>
              
              {/* Floating elements - hidden on mobile */}
              <div className="hidden lg:block absolute -top-4 -right-4 w-20 h-20 bg-gradient-wellness rounded-full opacity-60 animate-float" 
                   style={{ animationDelay: '2s' }}></div>
              <div className="hidden lg:block absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-primary rounded-full opacity-40 animate-float" 
                   style={{ animationDelay: '4s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground">
              Revolutionizing Ayurvedic Healthcare
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the perfect blend of ancient wisdom and modern technology 
              for comprehensive Panchakarma therapy management.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-wellness transition-all duration-300 hover:-translate-y-1 border-border/50">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold">
              Ready to Transform Your Healing Journey?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of patients and practitioners who trust AyurSutra 
              for their Panchakarma therapy management.
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              Start Your Journey Today
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/Ayursutra.png" alt="AyurSutra Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-primary">AyurSutra</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 AyurSutra. All rights reserved. Empowering holistic healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;