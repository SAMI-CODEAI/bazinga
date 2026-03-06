import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    hasProfile: boolean | null;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updatePassword: (newPassword: string) => Promise<{ error: any }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAppUrl = (): string => {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'https://localhost:3000';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const { toast } = useToast();

    const checkProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, department, year_of_study')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error("Error fetching profile:", error);
                // On error, we keep hasProfile as null to avoid incorrect redirects
                return;
            }

            if (data && data.full_name && data.department && data.year_of_study) {
                setHasProfile(true);
            } else {
                setHasProfile(false);
            }
        } catch (error) {
            console.error("Critical error in checkProfile:", error);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await checkProfile(user.id);
        }
    };

    useEffect(() => {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (!session) {
                    setLoading(false);
                    setHasProfile(null);
                }
            }
        );

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (!session) {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initProfile = async () => {
            if (user) {
                // Only set loading to true if we don't have a profile yet to avoid flickering
                if (hasProfile === null) {
                    setLoading(true);
                }

                await checkProfile(user.id);

                if (isMounted) {
                    setLoading(false);
                }
            } else {
                if (isMounted) {
                    setHasProfile(null);
                    setLoading(false);
                }
            }
        };

        initProfile();
        return () => { isMounted = false; };
    }, [user]);

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const redirectUrl = `${getAppUrl()}/`;
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: { full_name: fullName },
                },
            });

            if (error) throw error;
            toast({
                title: "Account created!",
                description: "Please check your email to verify your account.",
            });
            return { error: null };
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
            });
            return { error: null };
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            return { error };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast({
                title: "Signed out",
                description: "You have been successfully signed out.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');
            const redirectUrl = `${getAppUrl()}/auth?reset=true`;
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
            if (error) throw error;
            toast({
                title: "Password reset email sent",
                description: "Please check your email for the password reset link.",
            });
            return { error: null };
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            return { error };
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast({
                title: "Password updated",
                description: "Your password has been successfully updated.",
            });
            return { error: null };
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            return { error };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            hasProfile,
            signUp,
            signIn,
            signOut,
            resetPassword,
            updatePassword,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
