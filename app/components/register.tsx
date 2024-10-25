"use client";
import { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async () => {
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      clearForm();
    } catch (error) {
      console.log(error);
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
      <button onClick={handleSubmit}>sign up</button>
    </div>
  );
}
