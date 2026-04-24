// app/api/posts/[id]/comments/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addComment } from "@/lib/repository";

export async function POST(req, { params }) {
  try {
    // check authentication
    const userId = Number(cookies().get("userId")?.value);
    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized", status: 401 } },
        { status: 401 }
      );
    }

    // validate content
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: { message: "Content is required", status: 400 } },
        { status: 400 }
      );
    }

    // create comment
    const { data, error } = await addComment(
      userId,
      Number(params.id),
      content.trim()
    );

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
