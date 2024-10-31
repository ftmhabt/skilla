import Link from "next/link";
import { ModeToggle } from "../../components/mode-toggle";

const Navbar = () => {
  return (
    <nav className="bg-primary dark:bg-slate-700 text-white">
      <div className="py-2 container mx-auto px-5 flex justify-between items-center">
        <ModeToggle />
        <Link href={"/"} className="text-3xl">
          skilla
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
