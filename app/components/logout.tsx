"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();
  const signout = () => {
    signOut({ redirect: false }).then(() => {
      router.push("/");
    });
  };
  return <Button onClick={signout}>logout</Button>;
}
