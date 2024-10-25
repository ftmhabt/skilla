import RegisterForm from "./components/register";
import Signin from "./components/signin";

export default function Home() {
  return (
    <div className="w-[300px] m-auto">
      <Signin />
      <RegisterForm />
    </div>
  );
}
