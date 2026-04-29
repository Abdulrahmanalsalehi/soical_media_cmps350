import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { toggleLike } from "@/lib/repository";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    // get the logged in user ID from cookies
    const userId = Number((await cookies()).get("userId")?.value);
    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized", status: 401 } },
        { status: 401 }
      );
    }

    // toggle like
    const { data, error } = await toggleLike(userId, Number(id));

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    // return result (true = liked, false = unliked)
    return NextResponse.json({ data: { liked: data } }, { status: 200 });
  } catch (e) {

  return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}