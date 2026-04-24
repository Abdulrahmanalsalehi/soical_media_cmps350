// app/api/users/[id]/posts/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserPosts } from "@/lib/repository";

// fetch all posts for a user
export async function GET(req, { params }) {
  try {
    // get logged in user id from cookies (viewer)
    const viewerId = Number(cookies().get("userId")?.value) || null;

    // fetch posts for the profile user
    const { data, error } = await getUserPosts(Number(params.id), viewerId);

    // handle repository error
    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    // return posts
    return NextResponse.json({ data });
  } catch (e) {
    // catch unexpected server errors
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
