import Link from "next/link";
import { ModeToggle } from "../../components/mode-toggle";

const Navbar = () => {
  return (
    <nav className="bg-primary dark:bg-slate-700 text-white">
      <div className="flex py-2 container mx-auto px-5 justify-end items-center">
        <Link href={"/"} className="text-3xl self-end justify-self-end">
          skilla
        </Link>
        {/* <ModeToggle /> */}
      </div>
    </nav>
  );
};

export default Navbar;
