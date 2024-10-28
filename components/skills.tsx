"use client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Skill } from "@prisma/client";
export default function Skills() {
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);

  const handleAddSkill = async () => {
    const response = await fetch("/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: skillInput }),
    });

    if (response.ok) {
      const updatedSkills = await response.json();
      updatedSkills.map((data: Skill) => {
        setSkills([...skills, { id: data.id, name: data.name }]);
      });

      setSkillInput("");
    }
  };

  useEffect(() => {
    const fetchSkills = async () => {
      const response = await fetch("/api/skills");
      const skillsData = await response.json();
      skillsData.map((data: Skill) => {
        setSkills([...skills, { id: data.id, name: data.name }]);
      });
    };
    fetchSkills();
  }, []);

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
      <div>
        {skills.length > 0 &&
          skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-secondary w-[100px] h-[100px] rounded-full"
            >
              {skill.name}
            </div>
          ))}
      </div>
    </>
  );
}
