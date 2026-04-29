import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { toggleFollow, isFollowing } from "@/lib/repository";

// follow or unfollow a user
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    // get logged in user ID from cookies
    const followerId = Number((await cookies()).get("userId")?.value);
    if (!followerId) {
      return NextResponse.json(
        { error: { message: "Unauthorized", status: 401 } },
        { status: 401 }
      );
    }
    // cannot follow yourself
    const followingId = Number(id);
    if (followerId === followingId) {
      return NextResponse.json(
        { error: { message: "Cannot follow yourself", status: 400 } },
        { status: 400 }
      );
    }

    // toggle follow true = now following, false = unfollowed
    const { data, error } = await toggleFollow(followerId, followingId);

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    return NextResponse.json({ data: { followed: data } });
  } catch (e) {
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}

// check if one user follows another
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    // read followerId from query string
    const { searchParams } = new URL(req.url);
    const followerId = Number(searchParams.get("followerId"));
    const followingId = Number(id);

    if (!followerId) {
      return NextResponse.json({ data: { isFollowing: false } });
    }

    // check follow status
    const { data, error } = await isFollowing(followerId, followingId);

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    return NextResponse.json({ data: { isFollowing: data } });
  } catch (e) {
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
