import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const reqHeaders = await headers();
  const body = await req.text();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: reqHeaders.get("cookie") ?? "",
    },
    body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "text/plain",
      "x-vercel-ai-data-stream":
        response.headers.get("x-vercel-ai-data-stream") ?? "v1",
    },
  });
}
