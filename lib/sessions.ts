import axios from "axios";
import handleError from "./handleError";

const headers = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  "Content-Type": "application/json",
};
const skillSession = async () => {
  try {
    const sessionResponse = await axios.post(
      "https://api.metisai.ir/api/v1/chat/session",
      {
        botId: process.env.NEXT_PUBLIC_SKILL_BOT_ID,
      },
      { headers }
    );
    console.log("skill session created");
    return sessionResponse.data.id;
  } catch (error) {
    handleError(error);
  }
};
const skill2Session = async () => {
  try {
    const sessionResponse = await axios.post(
      "https://api.metisai.ir/api/v1/chat/session",
      {
        botId: process.env.NEXT_PUBLIC_SKILL_2_BOT_ID,
      },
      { headers }
    );
    console.log("skill 2 session created");
    return sessionResponse.data.id;
  } catch (error) {
    handleError(error);
  }
};
const roadmapSession = async () => {
  try {
    const sessionResponse = await axios.post(
      "https://api.metisai.ir/api/v1/chat/session",
      {
        botId: process.env.NEXT_PUBLIC_ROADMAP_BOT_ID,
      },
      { headers }
    );
    console.log("roadmap session created");
    return sessionResponse.data.id;
  } catch (error) {
    handleError(error);
  }
};

const checklistSession = async () => {
  try {
    const sessionResponse = await axios.post(
      "https://api.metisai.ir/api/v1/chat/session",
      {
        botId: process.env.NEXT_PUBLIC_CHECKLIST_BOT_ID,
      },
      { headers }
    );
    console.log("roadmap session created");
    return sessionResponse.data.id;
  } catch (error) {
    handleError(error);
  }
};
export {
  headers,
  skillSession,
  skill2Session,
  roadmapSession,
  checklistSession,
};
