// pages/api/skills.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const skills = await prisma.skill.findMany();
    res.status(200).json(skills);
  } else if (req.method === "POST") {
    const { name } = req.body;
    await prisma.skill.create({ data: { name } });
    const skills = await prisma.skill.findMany();
    res.status(200).json(skills);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
