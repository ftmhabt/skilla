import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <nav className="bg-primary dark:bg-slate-700 text-white">
      <div className="py-2 container mx-auto px-5 flex justify-between items-center">
        <div>
          <p className="text-3xl">Planit</p>
        </div>
        <div className="flex items-center">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>💀</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/auth">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
