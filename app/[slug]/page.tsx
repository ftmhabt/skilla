"use client";
import { Button } from "@/components/ui/button";
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
import { useGlobalContext } from "@/context/context";
import loadingSvg from "../img/loading.svg";
import Image from "next/image";

export default function Home({ params }: { params: { slug: string } }) {
  const { fields, setFields } = useGlobalContext();

  const [loading, setLoading] = useState(true);
  const [questionGenerationError, setQuestionGenerationError] = useState(false);
  const [field] = useState(params.slug);

  const newField = fields.find((f) => f.name === field);

  const updateItemInArray = (id: number) => {
    if (newField) {
      const updatedArray = fields.map((item) =>
        item.id === id ? newField : item
      );
      setFields(updatedArray);
    }
  };
  const [questions, setQuestions] = useState<
    | {
        id: number;
        question: string;
        options: string[];
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
    setSubmitted(false);
    setQuestionGenerationError(false);
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
      setQuestionGenerationError(false);
      console.log("Message sent:", messageResponse.data);
    } catch (error) {
      setQuestionGenerationError(true);
      handleError(error);
    } finally {
      setLoading(false);
    }
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
      await getRoadmap();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
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

      const newRoadmap = array.map((item) => ({
        id: item.id,
        topic: item.topic,
        subtopics:
          item.subtopics?.map((sub: string) => ({
            name: sub,
            isChecked: false,
            checklist: null,
          })) || null,
      }));

      if (newField) {
        newField.roadmap = newRoadmap;
        updateItemInArray(newField.id);
      }

      console.log("Message sent:", messageResponse.data);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
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

      const array = JSON.parse(jsonString);

      const checklistArray = array.map((item: string) => ({
        name: item,
        isChecked: false,
      }));

      if (newField) {
        newField.roadmap = newField.roadmap.map((topic) => {
          return {
            ...topic,
            subtopics:
              topic.subtopics?.map((item) => {
                if (item.name === subtopic) {
                  return { ...item, checklist: checklistArray };
                }
                return item;
              }) || null,
          };
        });

        updateItemInArray(newField.id);
      }

      console.log(newField);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
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
      {newField?.roadmap.length === 0 && !questions && (
        <>
          <Button onClick={fetchQuestions} disabled={loading}>
            {loading ? (
              <Image src={loadingSvg} width={20} height={20} alt="loading" />
            ) : (
              "تولید سوالات"
            )}
          </Button>
          {questionGenerationError && "نشد :( یه بار دیگه امتحان کن"}
        </>
      )}
      {newField?.roadmap.length === 0 && !submitted ? (
        <div className="flex flex-col gap-3">
          {questions && (
            <>
              {questions.map(
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
            </>
          )}
        </div>
      ) : (
        <>
          <Button
            disabled={loading}
            onClick={() => {
              getWeakness();
            }}
          >
            {loading ? (
              <Image src={loadingSvg} width={20} height={20} alt="loading" />
            ) : (
              "تولید نقشه راه"
            )}
          </Button>
          {newField?.roadmap.map(
            (item) =>
              item.subtopics && (
                <div key={item.id}>
                  <h1 className="mb-4">{item.topic}</h1>
                  <ul>
                    {item.subtopics &&
                      item.subtopics.map((sub, index) => (
                        <li
                          key={index}
                          className="grid grid-cols-4 p-2 max-w-[350px] items-center content-stretch"
                        >
                          <div className="flex gap-2 col-span-3">
                            <Checkbox
                              id={sub.name}
                              value={sub.name}
                              checked={sub.isChecked}
                              onChange={(e) => {
                                const target = e.target as HTMLInputElement;
                                const isChecked = target.checked;
                                if (newField) {
                                  const updatedRoadmap = newField.roadmap.map(
                                    (i) => {
                                      if (i.id === item.id) {
                                        return {
                                          ...i,
                                          subtopics:
                                            i.subtopics?.map((sub) => {
                                              if (sub.name === sub.name) {
                                                return { ...sub, isChecked };
                                              }
                                              return sub;
                                            }) || null,
                                        };
                                      }
                                      return item;
                                    }
                                  );

                                  newField.roadmap = updatedRoadmap;
                                  updateItemInArray(newField.id);
                                }
                              }}
                              className="appearance-none w-[20px] h-[20px]"
                            />
                            <label htmlFor={sub.name}>{sub.name}</label>
                          </div>

                          <Button
                            className="w-[25px] h-[25px] p-px justify-self-end"
                            variant="outline"
                            disabled={loading}
                            value={sub.name}
                            onClick={() => {
                              getChecklist(sub.name, item.topic);
                            }}
                          >
                            <RiAiGenerate color="#453875" />
                          </Button>
                          {sub.checklist && sub.checklist.length > 0 && (
                            <ul className="col-span-4 flex flex-col gap-4 p-4 items-center">
                              {sub.checklist.map((i) => (
                                <li
                                  key={i.name}
                                  className="flex gap-5 relative w-[300px] h-[60px]"
                                >
                                  <input
                                    type="checkbox"
                                    id={i.name}
                                    value={i.name}
                                    checked={i.isChecked}
                                    className="peer appearance-none w-[300px] h-[60px] bg-white checked:bg-secondary checked:border-0 border-primary border transition-colors duration-300 rounded-lg "
                                  />
                                  <label
                                    className="absolute w-[300px] pr-2 pl-5 self-center leading-tight"
                                    htmlFor={i.name}
                                  >
                                    {i.name}
                                  </label>
                                  <TiInputChecked
                                    color="#453875"
                                    className="absolute left-2 self-center transition-opacity duration-300 opacity-0 peer-checked:opacity-100"
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )
          )}
        </>
      )}
    </div>
  );
}
