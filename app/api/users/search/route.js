// app/api/users/search/route.js
import { NextResponse } from "next/server";
import { searchUsers } from "@/lib/repository";

// search for users by query string
export async function GET(req) {
  try {
    // read query string from URL
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    // require at least 2 characters
    if (q.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // call repository to search users
    const { data, error } = await searchUsers(q);

   
    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    // return search results
    return NextResponse.json({ data });
  } catch (e) {
    
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
