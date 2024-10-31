"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useGlobalContext } from "@/context/context";

export default function Skills() {
  const [skillInput, setSkillInput] = useState("");
  const { fields, setFields } = useGlobalContext();

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const newSkill = {
        id: fields.length + 1,
        name: skillInput,
        roadmap: [],
      };
      setFields([...fields, newSkill]);

      setSkillInput("");
    }
  };
  return (
    <>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="چه مهارتی رو میخوای ارتقا بدی؟"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
        />
        <Button onClick={handleAddSkill}>
          <Plus />
        </Button>
      </div>
      <div className="flex gap-4">
        {fields.length > 0 &&
          fields.map((skill) => (
            <Link
              href={`/${skill.name}`}
              key={skill.id}
              className="bg-secondary w-[100px] h-[100px] rounded-full flex justify-center items-center"
            >
              <h1>{skill.name}</h1>
            </Link>
          ))}
      </div>
    </>
  );
}
