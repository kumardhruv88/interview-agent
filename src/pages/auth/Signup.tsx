import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2, ArrowLeft } from "lucide-react";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            toast({
                title: "Account created!",
                description: "You can now sign in to your account.",
            });

            // Depending on Supabase settings, might auto-login or require verification
            // For now, redirect to login or dashboard
            navigate("/login");

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Google Sign-in Failed",
                description: error.message,
            });
        }
    };

    const handleDevMode = () => {
        localStorage.setItem("devMode", "true");
        window.location.href = "/dashboard";
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container flex items-center justify-center min-h-screen pt-20">
                <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border border-border shadow-lg relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <div className="text-center space-y-2 pt-4">
                        <h1 className="text-2xl font-bold">Create Account</h1>
                        <p className="text-muted-foreground">Start your journey to interview mastery</p>
                    </div>

                    <div className="space-y-4">
                        {/* Google Sign-in Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleSignup}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <p className="text-xs text-muted-foreground">At least 6 characters</p>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Sign Up
                            </Button>
                        </form>
                    </div>

                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-semibold">
                            Log in
                        </Link>
                    </div>

                    <div className="text-center text-sm pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={handleDevMode}
                            className="text-muted-foreground hover:text-primary transition-colors text-xs flex items-center justify-center w-full"
                        >
                            Enter Dev Mode (Bypass Auth)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
