"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async () => {
    try {
      const signupResponse = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      clearForm();
      if (signupResponse && signupResponse.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your email and password to sign up
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" onClick={handleSubmit}>
            Sign Up
          </Button>
          {/* <Button variant="outline" className="w-full">
            Sign Up with Github
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
