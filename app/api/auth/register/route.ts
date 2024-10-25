import { NextResponse } from "next/server";
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
    return user;
  } catch (error) {
    console.log(error);
  }

  return NextResponse.json({ message: "success" });
}
