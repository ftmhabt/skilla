import Link from "next/link";
import { ModeToggle } from "../../components/mode-toggle";
import Image from "next/image";
import Logo from "../img/logo.png";

const Navbar = () => {
  return (
    <nav className="bg-primary text-white">
      <div className="flex py-2 container mx-auto px-5 justify-between items-center sm:mx-auto sm:w-[400px]">
        <ModeToggle />
        <Link href={"/"} className="text-3xl self-end justify-self-end">
          <Image src={Logo} alt="logo" width={80} height={30} className="p-1" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
