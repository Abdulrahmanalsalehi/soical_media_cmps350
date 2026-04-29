import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// end session
export async function POST() {
  (await cookies()).delete("userId");
  return NextResponse.json({ success: true });
}
