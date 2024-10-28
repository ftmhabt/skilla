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
import { Checkbox } from "@/components/ui/checkbox";
import { TiInputChecked } from "react-icons/ti";
import { RiAiGenerate } from "react-icons/ri";
import Skills from "@/components/skills";
export default function Home() {
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getWeakness = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const getRoadmap = async () => {
    setLoading(true);
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
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getChecklist = async (subtopic: string, topic: string) => {
    setLoading(true);
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
    setLoading(false);
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
      {/* <Skills /> */}
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
                disabled={loading}
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
                        <h1 className="mb-4">{topic.topic}</h1>
                        <ul>
                          {topic.subtopics?.length !== 0 &&
                            topic.subtopics.map((subtopic, index) => (
                              <li
                                key={index}
                                className="grid grid-cols-4 p-2 max-w-[350px] items-center content-stretch"
                              >
                                <div className="flex gap-2 col-span-3">
                                  <Checkbox
                                    id={subtopic}
                                    value={subtopic}
                                    className="appearance-none w-[20px] h-[20px]"
                                  />
                                  <label htmlFor={subtopic}>{subtopic}</label>
                                </div>

                                <Button
                                  className="w-[25px] h-[25px] p-px justify-self-end"
                                  variant="outline"
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
                                  <RiAiGenerate color="#453875" />
                                </Button>
                                {topicList.length > 0 && (
                                  <ul className="col-span-4 flex flex-col gap-4 p-4 items-center">
                                    {topicList.map(
                                      (topics) =>
                                        topics.name === subtopic &&
                                        topics.list &&
                                        topics.list.map((check) => (
                                          <li
                                            key={`${subtopic}-${check}`}
                                            className="flex gap-5 relative w-[300px] h-[60px]"
                                          >
                                            <input
                                              type="checkbox"
                                              id={check}
                                              value={check}
                                              className="peer appearance-none w-[300px] h-[60px] bg-white checked:bg-secondary checked:border-0 border-primary border transition-colors duration-300 rounded-lg "
                                            />
                                            <label
                                              className="absolute w-[300px] pr-2 pl-5 self-center leading-tight"
                                              htmlFor={check}
                                            >
                                              {check}
                                            </label>
                                            <TiInputChecked
                                              color="#453875"
                                              className="absolute left-2 self-center transition-opacity duration-300 opacity-0 peer-checked:opacity-100"
                                            />
                                          </li>
                                        ))
                                    )}
                                  </ul>
                                )}
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
