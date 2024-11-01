"use client";

import * as React from "react";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function ModeToggle({ needBg = false }) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      onClick={() => {
        if (theme === "light") setTheme("dark");
        else setTheme("light");
      }}
      variant="outline"
      size="icon"
      className={`${
        needBg ? "" : "bg-transparent"
      } w-7 h-7 overflow-hidden rounded-full hover:text-white border-0 p-2 `}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
