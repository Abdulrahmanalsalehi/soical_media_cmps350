import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllPosts, createPost } from "@/lib/repository";

export async function GET() {
  const userId = Number(cookies().get("userId")?.value) || null;
  const posts = await getAllPosts(userId);
  return NextResponse.json(posts);
}

export async function POST(req) {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim())
    return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const post = await createPost(userId, content.trim());
  return NextResponse.json(post, { status: 201 });
}
