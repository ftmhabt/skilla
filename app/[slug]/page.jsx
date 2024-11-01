"use client";
import { Button } from "@/components/ui/button";
import { Fragment, useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TiInputChecked } from "react-icons/ti";
import { RiAiGenerate } from "react-icons/ri";
import loadingSvg from "../img/loading.svg";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";

export default function Home({ params }) {
  const [loading, setLoading] = useState(false);
  const [fieldName] = useState(params.slug);
  const newField = useLiveQuery(async () => {
    return await db.fields.where("name").equals(fieldName).toArray();
  });

  const [currentField, setCurrentField] = useState(null);

  useEffect(() => {
    if (newField && newField.length > 0) {
      setCurrentField(newField[0]);
    }
  }, [newField]);

  const [questions, setQuestions] = useState(null);

  const [answers, setAnswers] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "یه زمینه برنامه نویسی دریافت کن و بر اساس اون یه پرسشنامه چهار گزینه ای براس سنجش دانش کاربر به فارسی بساز. اطمینان حاصل کن که سوالاتی که از کاربر پرسیده می‌شود، به اندازه کافی متنوع و گسترده باشند. می‌توانی سوالات را در زمینه‌های مختلف مانند مفاهیم پایه، الگوریتم‌ها، ساختار داده‌ها، ابزارهای خاص، فریم‌ورک‌ها، و تجربه عملی طراحی کنی. دقیقا 10 سوال بپرس ",
  });
  const weaknessModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "براساس آبجکت شامل آرایه سوالات و آرایه جواب های متناظری که دریافت میکنی هر مبحثی که توش نقطه ضعف میبینی (هر مبحث به صورت یک یا دو کلمه) توی یه آرایه لیست کن و بده",
  });

  const roadmapModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      " weakness و field رو دریافت کن و یه چک لیست از چیزایی که باید یاد بگیرم درست کن کن و به صورت آرایه json بفرست \nsubtopic یعنی اون topic ها رو به موضوعات کوچکتر تقسیم کن",
  });

  const checklistModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "یه موضوع و یه زمینه دریافت میکنی. اون موضوع رو در اون زمینه به صورت چک لیست برای یادگیری ارائه بده. چک لیست فارسی باشه ",
  });

  const checklistGenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        checklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              isChecked: {
                type: "boolean",
              },
              id: {
                type: "number",
              },
            },
            required: ["name", "isChecked", "id"],
          },
        },
      },
      required: ["checklist"],
    },
  };

  const roadmapGenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        roadmap: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "number",
              },
              topic: {
                type: "string",
              },
              subtopics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    isChecked: {
                      type: "boolean",
                    },
                  },
                  required: ["name", "isChecked"],
                },
              },
            },
            required: ["id", "topic", "subtopics"],
          },
        },
      },
      required: ["roadmap"],
    },
  };

  const questionGenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "number",
              },
              question: {
                type: "string",
              },
              options: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["id", "question", "options"],
          },
        },
      },
      required: ["questions"],
    },
  };

  const weaknessGenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        weaknesses: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
  };
  function updateRoadmapInDb(updatedRoadmap) {
    // Ensure the updated roadmap syncs with IndexedDB
    if (currentField && currentField.id) {
      db.fields
        .update(currentField.id, { roadmap: updatedRoadmap })
        .catch((err) => {
          console.error("Failed to update IndexedDB:", err);
        });
    }
  }
  const handleCheckboxChange = (isChecked, subtopicName, topicId) => {
    const updatedRoadmap = currentField.roadmap.map((topic) => {
      if (topic.id === topicId) {
        const updatedSubtopics = topic.subtopics.map((subtopic) => {
          if (subtopic.name === subtopicName) {
            return { ...subtopic, isChecked };
          }
          return subtopic;
        });
        return { ...topic, subtopics: updatedSubtopics };
      }
      return topic;
    });

    setCurrentField({ ...currentField, roadmap: updatedRoadmap });
    updateRoadmapInDb(updatedRoadmap);
  };
  const handleChecklistItemChange = (
    isChecked,
    checklistItemName,
    subtopicName,
    topicId
  ) => {
    const updatedRoadmap = currentField.roadmap.map((topic) => {
      if (topic.id === topicId) {
        const updatedSubtopics = topic.subtopics.map((subtopic) => {
          if (subtopic.name === subtopicName) {
            const updatedChecklist = subtopic.checklist.map((item) => {
              if (item.name === checklistItemName) {
                return { ...item, isChecked }; // Update checklist item's isChecked state
              }
              return item;
            });
            return { ...subtopic, checklist: updatedChecklist };
          }
          return subtopic;
        });
        return { ...topic, subtopics: updatedSubtopics };
      }
      return topic;
    });

    setCurrentField({ ...currentField, roadmap: updatedRoadmap });
    updateRoadmapInDb(updatedRoadmap);
  };
  async function generateQuestion(input) {
    setLoading(true);
    const chatSession = model.startChat({
      generationConfig: questionGenerationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(input);
    const json = JSON.parse(result.response.text());
    if (json.questions) {
      setQuestions(json.questions);
      if (questions) setAnswers(Array(questions.length).fill(null));
      console.log("questions generated", json.questions);
    } else {
      console.error("Invalid response format", result);
    }
    setLoading(false);
  }

  async function findWeakness(object) {
    setLoading(true);
    const chatSession = weaknessModel.startChat({
      generationConfig: weaknessGenerationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(JSON.stringify(object));
    if (result.response) {
      const string = result.response.text();
      const json = JSON.parse(string);
      console.log("weaknesses generated", json.weaknesses);
      setWeaknesses(json.weaknesses);
      if (fieldName && weaknesses)
        await generateRoadmap({ fieldName, weaknesses });
    } else {
      console.error("Invalid response format", result);
    }
    setLoading(false);
  }

  async function generateRoadmap({ fieldName, weaknesses }) {
    setLoading(true);
    const combo = JSON.stringify({ fieldName, weaknesses });
    const chatSession = roadmapModel.startChat({
      generationConfig: roadmapGenerationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(combo);
    const json = JSON.parse(result.response.text());
    console.log("roadmap generated", json.roadmap);
    if (json) {
      const array = json.roadmap;
      const newRoadmap = array.map((item) => ({
        id: item.id,
        topic: item.topic,
        subtopics:
          item.subtopics?.map((sub) => ({
            name: sub.name,
            isChecked: false,
            checklist: null,
          })) || null,
      }));
      setCurrentField({ ...currentField, roadmap: newRoadmap });

      updateRoadmapInDb(newRoadmap);
    } else {
      console.error("Invalid response format", result);
    }
    setLoading(false);
  }

  async function getChecklist(subtopic, topic) {
    setLoading(true);
    const str = subtopic + " در زمینه " + topic;

    const chatSession = checklistModel.startChat({
      generationConfig: checklistGenerationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(str);
    const json = JSON.parse(result.response.text());
    if (json) {
      console.log("checklist generated", json);
      const checklistArray = json.checklist;
      const newRoadmap = currentField.roadmap.map((topic) => {
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
      setCurrentField({ ...currentField, roadmap: newRoadmap });

      updateRoadmapInDb(newRoadmap);
    }

    setLoading(false);
  }

  const handleAnswerChange = (questionIndex, selectedOptionIndex) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = selectedOptionIndex;
    setAnswers(updatedAnswers);
  };

  return (
    currentField && (
      <div className="flex flex-col gap-3 min-h-96">
        <h1 className="text-2xl text-primary text-center bg-secondary rounded-md">
          {currentField.name}
        </h1>
        {!questions && currentField.roadmap.length === 0 && (
          <>
            <Button
              onClick={() => generateQuestion(params.slug)}
              disabled={loading}
            >
              {loading ? (
                <Image src={loadingSvg} width={20} height={20} alt="loading" />
              ) : (
                "تولید سوالات"
              )}
            </Button>
          </>
        )}
        {!submitted && currentField.roadmap.length === 0 ? (
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
            {currentField.roadmap.length === 0 ? (
              <Button
                disabled={loading}
                onClick={() => {
                  const questionArray = questions.map((q) => q.question);
                  findWeakness({ questionArray, answers });
                }}
              >
                {loading ? (
                  <Image
                    src={loadingSvg}
                    width={20}
                    height={20}
                    alt="loading"
                  />
                ) : (
                  "تولید نقشه راه"
                )}
              </Button>
            ) : (
              currentField?.roadmap.map(
                (item) =>
                  item.subtopics && (
                    <div
                      key={item.id}
                      className="flex flex-col justify-center items-center *:w-[300px]"
                    >
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
                                  checked={sub.isChecked}
                                  onChange={(event) =>
                                    handleCheckboxChange(
                                      event.target.checked,
                                      sub.name,
                                      item.id
                                    )
                                  }
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
                                        onChange={(event) =>
                                          handleChecklistItemChange(
                                            event.target.checked,
                                            i.name,
                                            sub.name,
                                            item.id
                                          )
                                        }
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
              )
            )}
          </>
        )}
      </div>
    )
  );
}