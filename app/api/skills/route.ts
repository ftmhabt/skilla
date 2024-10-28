import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const skills = await prisma.skill.findMany();
  if (skills) return Response.json(skills);
  else return Response.json(null);
}

export async function POST(req: Request) {
  // const body = await req.json();
  // const { name } = body;
  // await prisma.skill.create({ data: { name } });
  // const skills = await prisma.skill.findMany();
  // return Response.json(skills);
  try {
    const body = await req.json();
    console.log("Incoming body:", body); // Log the incoming body

    const { name } = body;

    if (!name) {
      return Response.json(
        { error: "Skill name is required" },
        { status: 400 }
      );
    }
    try {
      const newSkill = await prisma.skill.create({
        data: { name, userId: 1 }, // Ensure this matches your schema
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle known Prisma errors
        console.error("Prisma error:", error.message);
        return Response.json({ error: error.message }, { status: 400 });
      }
      console.error("Unexpected error:", error);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
    const skills = await prisma.skill.findMany();
    return Response.json(skills);
  } catch (error) {
    console.error("Error adding skill:", error); // Log the error
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
