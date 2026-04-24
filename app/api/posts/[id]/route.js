// app/api/posts/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPostById, deletePost } from "@/lib/repository";

export async function GET(req, { params }) {
  try {
    const userId = Number(cookies().get("userId")?.value) || null;

    const { data, error } = await getPostById(Number(params.id), userId);

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }
    if (!data) {
      return NextResponse.json(
        { error: { message: "Not found", status: 404 } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = Number(cookies().get("userId")?.value);
    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized", status: 401 } },
        { status: 401 }
      );
    }

    const { data, error } = await deletePost(Number(params.id), userId);

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }
    return NextResponse.json({ data: { success: true } });
    
  } catch (e) {
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
