import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chat = await prisma.chat.findUnique({
      where: { id: params.chatId, userId: user.id },
    });

    if (!chat)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const messages = await prisma.message.findMany({
      where: { chatId: params.chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text } = await request.json();
    if (!text)
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );

    const chat = await prisma.chat.findUnique({
      where: { id: params.chatId, userId: user.id },
    });
    if (!chat)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId: params.chatId,
        sender: "user",
        text,
      },
    });

    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for Victoria University students. Provide concise, friendly, and accurate answers.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const aiResponseText = completion.choices[0].message.content;

    const aiMessage = await prisma.message.create({
      data: {
        chatId: params.chatId,
        sender: "ai",
        text: aiResponseText || "Sorry, I couldn’t generate a response.",
      },
    });

    return NextResponse.json({ userMessage, aiMessage });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
