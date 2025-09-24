import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { ComponentProps } from "react";

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
  <NavigationMenu {...props}>
    <NavigationMenuList className="gap-3 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="/home">Home</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="/sqllab">SQL Lab</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/charts">Charts</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
      {/* <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="#"></Link>
        </NavigationMenuLink>
      </NavigationMenuItem> */}
    </NavigationMenuList>
  </NavigationMenu>
);
