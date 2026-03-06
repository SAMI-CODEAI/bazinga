import { Navigate, useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Bell, Hash, Calendar, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRandomQuote } from '@/utils/quotes';
import { useState } from 'react';

const Index = () => {
  const navigate = useNavigate();

  const vibeQuote = getRandomQuote('motivational');

  const features = [
    {
      title: "Connect",
      description: "Find friends and networking opportunities on campus.",
      icon: Users,
      path: "/connect",
      color: "text-green-400",
      bg: "bg-green-400/10",
      badges: ["Friends", "Network"]
    },
    {
      title: "Campus Pulse",
      description: "Stay updated with campus news, events, and announcements.",
      icon: Bell,
      path: "/pulse",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      badges: ["News", "Events"]
    },
    {
      title: "AnonySpace",
      description: "Share thoughts and questions anonymously with the campus.",
      icon: Hash,
      path: "/anonyspace",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      badges: ["Anonymous", "Safe"]
    },
    {
      title: "ClubVerse",
      description: "Discover and join student clubs and organizations.",
      icon: Calendar,
      path: "/clubverse",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      badges: ["Clubs", "Activities"]
    },
    {
      title: "Messages",
      description: "Chat with your connections in real-time.",
      icon: MessageSquare,
      path: "/messages",
      color: "text-red-400",
      bg: "bg-red-400/10",
      badges: ["Real-time", "Secure"]
    }
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 text-center">
        <div className="animate-bounce-slight inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pop/10 border border-pop/20 text-pop text-sm font-medium mb-4 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span>Welcome to the future of campus social</span>
        </div>

        {/* Vibe of the Day Banner */}
        <div className="max-w-xl mx-auto mb-8 animate-fade-in">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pop via-purple-500 to-glow rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative px-6 py-4 bg-background leading-none rounded-2xl flex flex-col items-center gap-3 border border-white/5">
              <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Vibe of the Day</span>
              <p className="text-lg font-handwriting italic text-foreground text-center line-clamp-2 leading-tight">
                "{vibeQuote}"
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <span className="block text-white mb-2">Connect globally,</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pop via-purple-500 to-glow animate-pulse-glow">Vibe locally.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
          Bazinga is the ultimate platform for students to connect, share, and discover everything happening on campus.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
          <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-pop/25 bg-pop hover:bg-pop/90 text-white transition-all hover:scale-105" onClick={() => navigate('/connect')}>
            Start Connecting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-white/10 hover:bg-white/5 hover:border-glow/30 transition-all hover:scale-105" onClick={() => navigate('/profile')}>
            Complete Profile
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-3xl p-6 group cursor-pointer relative overflow-hidden animate-scale-in hover:-translate-y-2 hover:shadow-2xl hover:shadow-pop/10 transition-all duration-300"
              style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}
              onClick={() => navigate(feature.path)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-700" />

              <div className="mb-6 flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${feature.bg} ${feature.color} ring-1 ring-inset ring-white/5 transition-transform group-hover:scale-110 duration-300`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <div className="bg-white/5 rounded-full p-2 text-muted-foreground group-hover:text-white group-hover:bg-pop/20 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pop transition-colors">
                {feature.title}
              </h3>

              <p className="text-muted-foreground mb-6 line-clamp-2">
                {feature.description}
              </p>

              <div className="flex gap-2 flex-wrap">
                {feature.badges.map(badge => (
                  <Badge key={badge} variant="secondary" className="bg-white/5 hover:bg-white/10 border-white/5 text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          {/* Coming Soon Card */}
          <div className="glass-card rounded-3xl p-6 border-dashed border-white/10 flex flex-col justify-center items-center text-center animate-scale-in" style={{ animationDelay: '0.9s' }}>
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">More Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Gamified Momentum, AI recommendations, and premium features are on the way.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
