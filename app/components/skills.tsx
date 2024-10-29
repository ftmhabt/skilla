"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { Skill } from "@prisma/client";
import axios from "axios";
export default function Skills() {
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);

  const handleAddSkill = async () => {
    const response = await axios.post("/api/skills", {
      name: skillInput,
    });

    if (response.data) {
      const updatedSkills = response.data;
      updatedSkills.forEach((data: Skill) => {
        setSkills([...skills, { id: data.id, name: data.name }]);
      });

      setSkillInput("");
    }
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get("/api/skills");
        console.log(response);
        const skillsData = response.data;
        if (skillsData.length > 0) {
          skillsData.forEach((data: Skill) => {
            setSkills([...skills, { id: data.id, name: data.name }]);
          });
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
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
      <div className="flex gap-4">
        {skills.length > 0 &&
          skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-secondary w-[100px] h-[100px] rounded-full flex justify-center items-center"
            >
              <h1>{skill.name}</h1>
            </div>
          ))}
      </div>
    </>
  );
}
