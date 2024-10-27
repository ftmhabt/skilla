"use client";
import { Button } from "@/components/ui/button";
import Logout from "./components/logout";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import handleError from "@/lib/handleError";
import {
  skillSession,
  skill2Session,
  roadmapSession,
  checklistSession,
  headers,
} from "@/lib/sessions";
import { extractJson } from "@axync/extract-json";

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

  const [skillSessionId, setSkillSessionId] = useState<number | null>(null);
  const [skill2SessionId, setSkill2SessionId] = useState<number | null>(null);
  const [roadmapSessionId, setRoadmapSessionId] = useState<number | null>(null);
  const [checklistSessionId, setChecklistSessionId] = useState<number | null>(
    null
  );
  useEffect(() => {
    initializeSessions();
  }, []);

  const initializeSessions = async () => {
    setLoading(true);
    const skillId = await skillSession();
    setSkillSessionId(skillId);
    const skill2Id = await skill2Session();
    setSkill2SessionId(skill2Id);
    const roadmapId = await roadmapSession();
    setRoadmapSessionId(roadmapId);
    const checklistId = await checklistSession();
    setChecklistSessionId(checklistId);
    setLoading(false);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${skillSessionId}/message`,
        {
          message: {
            content: field,
            type: "USER",
          },
        },
        { headers }
      );
      const str = messageResponse.data.content;

      const array = await extractJson(str);
      console.log(array);

      if (array) {
        setQuestions(array);
        setAnswers(Array(array.length).fill(null));
      }

      console.log("Message sent:", messageResponse.data);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  };

  const getWeakness = async () => {
    try {
      const comb = JSON.stringify({ questions, answers });
      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${skill2SessionId}/message`,
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
    } catch (error) {
      handleError(error);
    }
  };

  const getRoadmap = async () => {
    try {
      const comb = JSON.stringify({ field, weaknesses });
      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${roadmapSessionId}/message`,
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
      const str = messageResponse.data.content;

      const array = await extractJson(str);
      console.log(array);

      setRoadmap(array);
      console.log("Message sent:", messageResponse.data);
      // setLoading(false);
    } catch (error) {
      handleError(error);
    }
  };

  const getChecklist = async (subtopic: string, topic: string) => {
    const str = subtopic + " در زمینه " + topic;
    try {
      const messageResponse = await axios.post(
        `https://api.metisai.ir/api/v1/chat/session/${checklistSessionId}/message`,
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
      handleError(error);
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
                questions.map(
                  (q, questionIndex) =>
                    q.options && (
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
                    )
                )}
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
                roadmap.map(
                  (topic) =>
                    topic.subtopics && (
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
                    )
                )}
            </div>
          )}
        </div>
      )}
      <Logout />
    </div>
  );
}
