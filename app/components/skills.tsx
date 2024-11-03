"use client";
import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
export default function Skills() {
  const suggestions = [
    "React",
    "Vue",
    "Angular",
    "Svelte",
    "Next.js",
    "Nuxt.js",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Laravel",
    "Spring Boot",
    "Ruby on Rails",
    "ASP.NET",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "Kotlin",
    "Swift",
  ];

  const [skillInput, setSkillInput] = useState("");

  const fields = useLiveQuery(() => db.fields.toArray());

  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value.replace(/%20/g, "-").replace(/\s+/g, "-");
    setSkillInput(userInput);

    // Filter suggestions based on input
    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().startsWith(userInput.toLowerCase())
    );

    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSkillInput(suggestion);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100); // Add a small delay for click events to register
  };

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
    <div className="relative flex flex-col gap-3 min-h-96 mx-auto">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="چه مهارتی رو میخوای ارتقا بدی؟"
          value={skillInput}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setShowSuggestions(true)}
        />
        <Button onClick={handleAddSkill}>
          <Plus />
        </Button>
      </div>
      {showSuggestions && skillInput && (
        <ul className="bg-white border border-secondary rounded-md absolute top-10 w-full flex flex-col ">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <li
                className="cursor-pointer hover:bg-secondary px-2 py-1"
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))
          ) : (
            <li>No suggestions available</li>
          )}
        </ul>
      )}
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
    </div>
  );
}
