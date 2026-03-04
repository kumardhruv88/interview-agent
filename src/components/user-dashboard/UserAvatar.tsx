import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

export const UserAvatar = () => {
    const { user } = useAuth();

    // Extract first letter from email or use 'U' as fallback
    const getInitial = () => {
        if (!user?.email) return 'U';
        return user.email.charAt(0).toUpperCase();
    };

    // Extract username from email (part before @)
    const getUserName = () => {
        if (!user?.email) return 'User';
        return user.email.split('@')[0];
    };

    return (
        <div className="cursor-pointer">
            {/* Avatar Circle */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-500 to-blue-500 text-white font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-110">
                {user ? getInitial() : <User className="w-5 h-5" />}
            </div>
        </div>
    );
};
