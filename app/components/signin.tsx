"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signin() {
  const router = useRouter();
  const [error, setError] = useState<null | string>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const clearForm = () => {
    setEmail("");
    setPassword("");
  };
  const handleSubmit = async () => {
    const signinResponse = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    clearForm();
    if (signinResponse && !signinResponse.error) {
      router.push("/main");
    } else {
      setError("email or password is incorrect");
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="email">email</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="password">password</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>sign in</button>
      {error ? <>{error}</> : null}
      <hr />
    </div>
  );
}
