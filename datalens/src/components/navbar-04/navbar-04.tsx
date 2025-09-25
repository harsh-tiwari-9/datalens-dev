import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import { UserProfile } from "./user-profile";

const Navbar04Page = () => {
  return (
    <div>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-7xl h-16 bg-background border dark:border-slate-700/70 rounded-full shadow-sm z-1000">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-base font-semibold tracking-tight">Jio DataLens</span>
          </div>

          {/* Desktop Menu */}
          <div className="flex items-center gap-4">
            <NavMenu className="hidden md:block" />
            <UserProfile className="hidden sm:block" />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar04Page;
