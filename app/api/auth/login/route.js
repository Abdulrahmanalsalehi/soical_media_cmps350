// app/api/auth/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/repository";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // fetch user from repository
    const { data: user, error } = await getUserByEmail(email);

    if (error) {
      return NextResponse.json(error, { status: error.status });
    }
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // set cookie
    cookies().set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
    });

    // return success
    return NextResponse.json({ data: { id: user.id, username: user.username } });
  } catch (e) {
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
