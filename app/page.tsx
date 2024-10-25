"use client";
import { Button } from "@/components/ui/button";
import Logout from "./components/logout";
import { Fragment, useState } from "react";
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<
    {
      id: number;
      question: string;
      options: string[];
      correct_answer: number;
    }[]
  >([]);

  const [answers, setAnswers] = useState<number[]>([]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // First, create a session
      const sessionResponse = await axios.post(
        "https://api.metisai.ir/api/v1/chat/session",
        {
          botId: process.env.NEXT_PUBLIC_SKILL_BOT_ID,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("session created");
      const sessionId = sessionResponse.data.id; // Assuming 'id' is the session identifier

      // Then, send a message to that session
      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${sessionId}/message`,
        {
          message: {
            content: field, // Ensure 'field' is defined in your code's context
            type: "USER",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const array = JSON.parse(messageResponse.data.content);
      setQuestions(array.questions);
      setAnswers(Array(array.questions.length).fill(null));

      console.log("Message sent:", messageResponse.data);
      setLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Error status:", error.response.status);
          console.error("Error data:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleAnswerChange = (
    questionIndex: number,
    selectedOptionIndex: number
  ) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = selectedOptionIndex;
    setAnswers(updatedAnswers);
  };

  return (
    <div className="flex flex-col gap-3">
      <h1>skill assesment</h1>
      <label htmlFor="field">زمینه مورد نظر رو انتخاب کن:</label>
      <select
        name="field"
        id="field"
        value={field}
        onChange={(e) => setField(e.target.value)}
      >
        <option value="">select</option>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="React">React</option>
        <option value="Angular">Angular</option>
        <option value="Vue.js">Vue.js</option>
        <option value="Django">Django</option>
        <option value="Swift">Swift</option>
        <option value="Kotlin">Kotlin</option>
        <option value="Java">Java</option>
        <option value="Flutter">Flutter</option>
      </select>
      <Button onClick={fetchQuestions} disabled={loading}>
        {loading ? "صبر کنید" : "ثبت"}
      </Button>
      {questions.map((q, questionIndex) => (
        <Fragment key={q.id}>
          <h2>{q.question}</h2>
          <RadioGroup
            className="flex flex-col gap-3"
            dir="rtl"
            value={answers[questionIndex]?.toString()}
            onValueChange={(value) =>
              handleAnswerChange(questionIndex, parseInt(value))
            }
          >
            {q.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex gap-3">
                <RadioGroupItem
                  value={optionIndex.toString()}
                  id={`${q.id}-${optionIndex}`}
                />
                <Label htmlFor={`${q.id}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </Fragment>
      ))}
      {answers.map((a) => (
        <>{a}</>
      ))}
      <Logout />
    </div>
  );
}
