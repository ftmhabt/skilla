"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Link from "next/link";
// import { useGlobalContext } from "@/context/context";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
export default function Skills() {
  const [skillInput, setSkillInput] = useState("");
  // const { fields, setFields } = useGlobalContext();

  // const handleAddSkill = () => {
  //   if (skillInput.trim()) {
  //     const newSkill = {
  //       id: fields.length + 1,
  //       name: skillInput,
  //       roadmap: [],
  //     };
  //     setFields([...fields, newSkill]);
  //     console.log(fields);
  //     setSkillInput("");
  //   }
  // };
  const fields = useLiveQuery(() => db.fields.toArray());
  async function handleAddSkill() {
    try {
      // Add the new friend!
      await db.fields.add({
        name: skillInput,
        roadmap: [],
      });
      setSkillInput("");
    } catch (error) {
      console.log(`Failed to add ${skillInput}: ${error}`);
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
      <div className="grid grid-cols-3 gap-4">
        {fields?.map((skill) => (
          <Link
            href={`/${skill.name}`}
            key={skill.id}
            className="bg-secondary w-[100px] h-[100px] rounded-full flex justify-center text-center items-center"
          >
            <h1>{skill.name}</h1>
          </Link>
        ))}
      </div>
    </>
  );
}
