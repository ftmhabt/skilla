"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
export default function Skills() {
  const [skillInput, setSkillInput] = useState("");

  const fields = useLiveQuery(() => db.fields.toArray());
  async function handleAddSkill() {
    if (skillInput) {
      try {
        await db.fields.add({
          name: skillInput,
          roadmap: [],
        });
        setSkillInput("");
      } catch (error) {
        console.log(`Failed to add ${skillInput}: ${error}`);
      }
    }
  }
  return (
    <>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="چه مهارتی رو میخوای ارتقا بدی؟"
          value={skillInput}
          onChange={(e) =>
            setSkillInput(
              e.target.value.replace(/%20/g, "-").replace(/\s+/g, "-")
            )
          }
        />
        <Button onClick={handleAddSkill}>
          <Plus />
        </Button>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-4 items-center justify-between">
        {fields?.map((skill) => (
          <Link
            href={`/${skill.name}`}
            key={skill.id}
            className="bg-secondary aspect-square rounded-full flex justify-center text-center items-center"
          >
            <h1>{skill.name}</h1>
          </Link>
        ))}
      </div>
    </>
  );
}
