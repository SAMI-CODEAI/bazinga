import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, ArrowRight, User, BookOpen, GraduationCap } from 'lucide-react';
import { getRandomQuote } from '@/utils/quotes';

const Onboarding = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [quote] = useState(() => getRandomQuote('punchy'));

    const [formData, setFormData] = useState({
        full_name: '',
        department: '',
        year_of_study: '',
        bio: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.user_metadata?.full_name || ''
            }));
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!formData.full_name || !formData.department || !formData.year_of_study) {
            toast({
                title: "Missing Info",
                description: "Please fill in all required fields to continue.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    full_name: formData.full_name,
                    department: formData.department,
                    year_of_study: parseInt(formData.year_of_study),
                    bio: formData.bio,
                    email: user?.email,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Refresh profile state in auth context
            await refreshProfile?.();

            toast({
                title: "Welcome to Bazinga! 🎉",
                description: "Your profile has been set up successfully.",
            });

            navigate('/');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] animate-float" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[150px] animate-float" style={{ animationDelay: '-4s' }} />
            </div>

            <Card className="w-full max-w-lg glass-card border-white/10 shadow-2xl z-10 animate-scale-in">
                <CardHeader className="text-center pb-2">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-lg mb-4 overflow-hidden mx-auto">
                        <img src="/favicon.ico" alt="Bazinga Logo" className="h-12 w-12 object-contain" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Complete Your Profile</CardTitle>
                    <CardDescription className="text-lg">Let's get you set up with the campus community.</CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {step === 1 ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" /> Full Name
                                </Label>
                                <Input
                                    placeholder="Your full name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="bg-black/20 border-white/10 h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" /> Department
                                </Label>
                                <Select
                                    value={formData.department}
                                    onValueChange={(val) => setFormData({ ...formData, department: val })}
                                >
                                    <SelectTrigger className="bg-black/20 border-white/10 h-11">
                                        <SelectValue placeholder="Select your department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="computer-science">Computer Science</SelectItem>
                                        <SelectItem value="engineering">Engineering</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="arts">Arts</SelectItem>
                                        <SelectItem value="sciences">Sciences</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary" /> Year of Study
                                </Label>
                                <Select
                                    value={formData.year_of_study}
                                    onValueChange={(val) => setFormData({ ...formData, year_of_study: val })}
                                >
                                    <SelectTrigger className="bg-black/20 border-white/10 h-11">
                                        <SelectValue placeholder="Which year are you in?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1st Year</SelectItem>
                                        <SelectItem value="2">2nd Year</SelectItem>
                                        <SelectItem value="3">3rd Year</SelectItem>
                                        <SelectItem value="4">4th Year</SelectItem>
                                        <SelectItem value="5">5th Year+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full h-12 text-lg shadow-lg hover:shadow-primary/20 transition-all font-bold"
                                onClick={() => setStep(2)}
                            >
                                Next Step <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" /> Bio (Short & Sweet)
                                </Label>
                                <div className="overflow-hidden">
                                    <Textarea
                                        placeholder="Tell us a bit about yourself..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="bg-black/20 border-white/10 min-h-[120px] resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 border-white/10"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-[2] h-12 text-lg shadow-lg hover:shadow-primary/20 transition-all font-bold bg-gradient-to-r from-primary to-purple-600"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Start Exploring! 🚀"}
                                </Button>
                            </div>
                            {loading && (
                                <p className="text-[10px] text-center text-muted-foreground italic animate-pulse mt-2">
                                    "{quote}"
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


export default Onboarding;
