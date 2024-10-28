import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const skills = await prisma.skill.findMany();
  if (skills) return Response.json(skills);
  else return Response.json(null);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;
  await prisma.skill.create({ data: { name } });
  const skills = await prisma.skill.findMany();
  return Response.json(skills);
}
