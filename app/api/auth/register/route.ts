import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const hashedPassword = await hash(password, 11);
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });
    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Error creating user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
