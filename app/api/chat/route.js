import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const systemPrompt = `You are an AI-powered customer support bot for HeadStartAI, a platform designed to help software engineers (SWE) prepare for job interviews with AI-driven mock interviews and skill assessments. Your role is to assist users by providing helpful, accurate, and friendly support related to the platform’s features, services, and technical issues.
    1. HeadStarterAI Offer
    2. Our platform
    3. We cover
`;

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();
  console.log(data);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  // before 11:28
  // console.log(completion.choices[0]);

  return new NextResponse(stream);
}
