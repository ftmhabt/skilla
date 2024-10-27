"use client";
import { Button } from "@/components/ui/button";
import Logout from "./components/logout";
import { Fragment, useState } from "react";
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import isJson from "@/lib/isJson";
import extractJson from "@/lib/extractJson";

export default function Home() {
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<
    | {
        id: number;
        question: string;
        options: string[];
      }[]
    | null
  >(null);
  const [topicList, setTopicList] = useState<
    {
      name: string;
      list: string[] | null;
    }[]
  >([]);
  const [checklist, setChecklist] = useState<string[] | null>(null);

  const [roadmap, setRoadmap] = useState<
    | {
        id: number;
        topic: string;
        subtopics: string[];
      }[]
    | null
  >(null);

  const [answers, setAnswers] = useState<number[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
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
      let wholeArray = messageResponse.data.content;
      while (!isJson(wholeArray)) {
        console.log(wholeArray);
        const messageResponse = await axios.post(
          `https://api.metisai.ir/api/v1/chat/session/${sessionId}/message`,
          {
            message: {
              content: "go on",
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
        wholeArray += messageResponse.data.content;
      }
      console.log(wholeArray);
      const array = JSON.parse(wholeArray);
      setQuestions(array);
      setAnswers(Array(array.length).fill(null));

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

  const getWeakness = async () => {
    try {
      // First, create a session
      const sessionResponse = await axios.post(
        "https://api.metisai.ir/api/v1/chat/session",
        {
          botId: process.env.NEXT_PUBLIC_SKILL_2_BOT_ID,
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

      const comb = JSON.stringify({ questions, answers });
      // Then, send a message to that session
      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${sessionId}/message`,
        {
          message: {
            content: comb,
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
      console.log(array);
      setWeaknesses(array);
      getRoadmap();
      console.log("Message sent:", messageResponse.data);
      // setLoading(false);
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

  const getRoadmap = async () => {
    try {
      // First, create a session
      const sessionResponse = await axios.post(
        "https://api.metisai.ir/api/v1/chat/session",
        {
          botId: process.env.NEXT_PUBLIC_ROADMAP_BOT_ID,
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
      console.log(weaknesses);
      const comb = JSON.stringify({ field, weaknesses });
      console.log(comb);
      // Then, send a message to that session
      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${sessionId}/message`,
        {
          message: {
            content: comb,
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
      console.log(messageResponse.data.content);
      let wholeArray = messageResponse.data.content;
      while (!isJson(wholeArray)) {
        console.log(wholeArray);

        const sequelResponse = await axios.post(
          `https://api.metisai.ir/api/v1/chat/session/${sessionId}/message`,
          {
            message: {
              content: "go on",
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
        wholeArray += sequelResponse.data.content;
      }
      console.log(wholeArray);
      const array = JSON.parse(wholeArray);
      setRoadmap(array);
      console.log("Message sent:", messageResponse.data);
      // setLoading(false);
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

  const getChecklist = async (subtopic: string, topic: string) => {
    const str = subtopic + " در زمینه " + topic;
    try {
      // First, create a session
      const sessionResponse = await axios.post(
        "https://api.metisai.ir/api/v1/chat/session",
        {
          botId: process.env.NEXT_PUBLIC_CHECKLIST_BOT_ID,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("session created");
      const sessionId = sessionResponse.data.id;

      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${sessionId}/message`,
        {
          message: {
            content: str,
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
      console.log(messageResponse.data.content);
      const jsonString = messageResponse.data.content;
      return JSON.parse(jsonString);
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
    <div className="flex flex-col gap-3 min-h-96">
      <h1>Skill Assessment</h1>
      {!questions ? (
        <>
          <label htmlFor="field">زمینه مورد نظر رو انتخاب کن:</label>
          <select
            name="field"
            id="field"
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            <option value="">Select</option>
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
        </>
      ) : (
        <div>
          {!submitted ? (
            <div>
              {questions &&
                questions.map((q, questionIndex) => (
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
                          <Label htmlFor={`${q.id}-${optionIndex}`}>
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </Fragment>
                ))}
              <Button
                onClick={() => {
                  setSubmitted(true);
                }}
              >
                ثبت جواب‌ها
              </Button>
            </div>
          ) : (
            <div>
              <Button
                onClick={() => {
                  getWeakness();
                }}
              >
                تولید نقشه راه
              </Button>
              {roadmap &&
                roadmap.map((topic) => (
                  <div key={topic.id}>
                    <h1>{topic.topic}</h1>
                    <ul>
                      {topic.subtopics?.length !== 0 &&
                        topic.subtopics.map((subtopic, index) => (
                          <li key={index}>
                            <Button
                              value={subtopic}
                              onClick={() => {
                                getChecklist(subtopic, topic.topic).then(
                                  (res) =>
                                    setTopicList((prevTopicList) => [
                                      ...prevTopicList,
                                      {
                                        name: subtopic,
                                        list: res,
                                      },
                                    ])
                                );
                              }}
                            >
                              {subtopic}
                            </Button>
                            <ul>
                              {topicList.map(
                                (topics) =>
                                  topics.name === subtopic &&
                                  topics.list &&
                                  topics.list.map((check) => (
                                    <li key={`${subtopic}-${check}`}>
                                      {check}
                                    </li>
                                  ))
                              )}
                            </ul>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
      <Logout />
    </div>
  );
}
