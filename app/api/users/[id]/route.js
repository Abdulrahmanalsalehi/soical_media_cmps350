// app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserProfile, updateUserProfile } from "@/lib/repository";

// fetch a user profile
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    // get user profile by id
    const { data, error } = await getUserProfile(Number(id));

    // handle repository error
    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    // if no user found
    if (!data) {
      return NextResponse.json(
        { error: { message: "Not found", status: 404 } },
        { status: 404 }
      );
    }

    // return user profile
    return NextResponse.json({ data });
  } catch (e) {
    // catch unexpected server errors
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}

//  update a user profile
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    // get logged in user id from cookies
    const userId = Number((await cookies()).get("userId")?.value);

    // only allow updating your own profile
    if (userId !== Number(id)) {
      return NextResponse.json(
        { error: { message: "Forbidden", status: 403 } },
        { status: 403 }
      );
    }

    // read update data from request body
    const payload = await req.json();

    // update profile in repository
    const { data, error } = await updateUserProfile(userId, payload);

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }

    // return updated profile
    return NextResponse.json({ data });
  } catch (e) {

    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
