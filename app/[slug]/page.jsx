"use client";
import { Button } from "@/components/ui/button";
import { Fragment, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TiInputChecked } from "react-icons/ti";
import { RiAiGenerate } from "react-icons/ri";
import { useGlobalContext } from "@/context/context";
import loadingSvg from "../img/loading.svg";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home({ params }) {
  const { fields, setFields } = useGlobalContext();

  const [loading, setLoading] = useState(false);
  const [field] = useState(params.slug);

  const [newField] = useState(fields.find((f) => f.name === field));

  const updateItemInArray = (id) => {
    if (newField) {
      const updatedArray = fields.map((item) =>
        item.id === id ? newField : item
      );
      setFields(updatedArray);
    }
  };
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
      if (field && weaknesses) await generateRoadmap({ field, weaknesses });
    } else {
      console.error("Invalid response format", result);
    }
    setLoading(false);
  }

  async function generateRoadmap({ field, weaknesses }) {
    setLoading(true);
    const combo = JSON.stringify({ field, weaknesses });
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
      console.log("new roadmap", newRoadmap);
      if (newField) {
        newField.roadmap = newRoadmap;
        updateItemInArray(newField.id);
        console.log("newField.roadmap", newField.roadmap);
      }
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
    console.log("checklist generated", json);
    const checklistArray = json.checklist;

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
    setLoading(false);
  }

  const handleAnswerChange = (questionIndex, selectedOptionIndex) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = selectedOptionIndex;
    setAnswers(updatedAnswers);
  };

  return (
    <div className="flex flex-col gap-3 min-h-96">
      <h1>{newField?.name}</h1>
      {!questions && newField?.roadmap.length === 0 && (
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
      {!submitted && newField?.roadmap.length === 0 ? (
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
          {newField?.roadmap.length === 0 ? (
            <Button
              disabled={loading}
              onClick={() => {
                const questionArray = questions.map((q) => q.question);
                findWeakness({ questionArray, answers });
              }}
            >
              {loading ? (
                <Image src={loadingSvg} width={20} height={20} alt="loading" />
              ) : (
                "تولید نقشه راه"
              )}
            </Button>
          ) : (
            newField?.roadmap.map(
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
                                  const isChecked = e.target.checked;

                                  if (newField) {
                                    const updatedRoadmap = newField.roadmap.map(
                                      (roadmapItem) => {
                                        if (roadmapItem.id === item.id) {
                                          return {
                                            ...roadmapItem,
                                            subtopics:
                                              roadmapItem.subtopics?.map(
                                                (subtopicItem) => {
                                                  if (
                                                    subtopicItem.name ===
                                                    sub.name
                                                  ) {
                                                    return {
                                                      ...subtopicItem,
                                                      isChecked,
                                                    };
                                                  }
                                                  return subtopicItem;
                                                }
                                              ) || null,
                                          };
                                        }
                                        return roadmapItem;
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
            )
          )}
        </>
      )}
    </div>
  );
}
