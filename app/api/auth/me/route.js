import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/repository";


// get current user 
export async function GET() {
  const userId = Number((await cookies()).get("userId")?.value);
  if (!userId) return NextResponse.json({ data: null });

  const { data, error } = await getUserProfile(userId);

  if (error || !data) {
    return NextResponse.json({ data: null });
  }
  // rename password for safety 
  const { password: _pw, ...safeUser } = data;
  return NextResponse.json({ data: safeUser });
}
