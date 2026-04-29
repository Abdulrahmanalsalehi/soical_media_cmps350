import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addComment } from "@/lib/repository";



export async function POST(req, { params }) {
  try {
    const { id } = await params;
    // check authentication
    const userId = Number((await cookies()).get("userId")?.value);
    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized", status: 401 } },
        { status: 401 }
      );
    }

    // check content is not empty
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: { message: "Content is required", status: 400 } },
        { status: 400 }
      );
    }

    // create a comment
    const { data, error } = await addComment(
      userId,
      Number(id),
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
