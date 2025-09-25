import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { UserProfile } from "./user-profile";

interface NavigationSheetProps {
  className?: string
}

export const NavigationSheet = ({ className }: NavigationSheetProps) => {
  return (
    <div className={className}>
      <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-6 py-3">
        <div className="flex items-center justify-between">
          <Logo />
          <UserProfile />
        </div>
        <NavMenu orientation="vertical" className="mt-6 [&>div]:h-full" />
      </SheetContent>
    </Sheet>
    </div>
  );
};
