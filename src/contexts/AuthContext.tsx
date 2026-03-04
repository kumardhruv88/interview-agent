import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    signOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    signOut: async () => { },
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        const initAuth = async () => {
            const isDevMode = localStorage.getItem("devMode") === "true";
            
            if (isDevMode) {
                const devUser = {
                    id: "dev-user-123",
                    email: "dev@example.com",
                    user_metadata: { name: "Dev User" }
                } as unknown as User;
                setUser(devUser);
                setSession({
                    user: devUser,
                    access_token: "dev-token-123",
                    refresh_token: "dev-token-123",
                    expires_in: 3600,
                    token_type: "bearer"
                } as unknown as Session);
                setLoading(false);
                return;
            }

            try {
                // Add a timeout to prevent infinite loading if Supabase is misconfigured or hangs
                const getSessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Supabase initialization timeout')), 5000)
                );
                
                const response = await Promise.race([getSessionPromise, timeoutPromise]) as any;
                if (response && response.data) {
                    setSession(response.data.session);
                    setUser(response.data.session?.user ?? null);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }

            try {
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    (_event, session) => {
                        if (localStorage.getItem("devMode") === "true") return;
                        setSession(session);
                        setUser(session?.user ?? null);
                        setLoading(false);
                    }
                );
                return () => subscription.unsubscribe();
            } catch (err) {
                console.error("Auth state change error:", err);
            }
        };

        const unsubscribe = initAuth();
        return () => {
            unsubscribe.then(unsub => {
                if (unsub) unsub();
            });
        };
    }, []);

    const signOut = async () => {
        if (localStorage.getItem("devMode") === "true") {
            localStorage.removeItem("devMode");
            setUser(null);
            setSession(null);
            window.location.href = "/";
            return;
        }
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
