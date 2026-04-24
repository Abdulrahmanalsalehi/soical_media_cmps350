import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFollowingFeed } from "@/lib/repository";

export async function GET() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await getFollowingFeed(userId);
  return NextResponse.json(posts);
}
