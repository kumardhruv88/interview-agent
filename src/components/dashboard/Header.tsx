import { Bell, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    userName: string;
    streak: number;
}

export const Header = ({ userName, streak }: HeaderProps) => {
    return (
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10 w-full transition-all duration-300">
            <div className="flex-1 max-w-xl">
                <h1 className="text-2xl font-bold text-foreground">Welcome, {userName}!</h1>
                <p className="text-sm text-muted-foreground">Practice, earn streaks & boost your rank!</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse-slow" />
                    <span className="text-sm font-bold text-orange-400">{streak}</span>
                </div>

                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-white/5">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-glow"></span>
                </Button>

                <div className="h-8 w-px bg-white/10 mx-2"></div>

                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10 shadow-sm ring-1 ring-white/5">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                        <AvatarFallback className="bg-primary/20 text-primary">{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-foreground">{userName}</p>
                        <p className="text-xs text-muted-foreground">Candidate</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
