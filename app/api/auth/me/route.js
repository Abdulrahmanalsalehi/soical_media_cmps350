import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/repository";

export async function GET() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return NextResponse.json({ data: null });

  const { data, error } = await getUserProfile(userId);
  if (error || !data) return NextResponse.json({ data: null });

  const { password: _pw, ...safeUser } = data;
  return NextResponse.json({ data: safeUser });
}
