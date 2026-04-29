import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/repository";



export async function POST(req) {
  try {
    const { fullname, username, email, phone, dob, gender, password } = await req.json();

    // basic validation, make sure nothing is missing
    if (!fullname || !username || !email || !password) {
      return NextResponse.json(
        { error: { message: "Missing required fields", status: 400 } },
        { status: 400 }
      );
    }

    // check if email is unique
    const { data: existingEmail } = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: { message: "Email already registered", status: 409 } },
        { status: 409 }
      );
    }

    // check if username is unique
    const { data: existingUsername } = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: { message: "Username already taken", status: 409 } },
        { status: 409 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const { data: user, error } = await createUser({
      fullname,
      username,
      email,
      ...(phone ? { phone } : {}),
      ...(dob ? { dob: new Date(dob) } : {}),
      ...(gender ? { gender } : {}),
      password: hashedPassword,
    });

    if (error) {
      return NextResponse.json({ error }, { status: error.status ?? 500 });
    }

    return NextResponse.json(
      { data: { id: user.id, username: user.username } },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: { message: e.message, status: 500 } },
      { status: 500 }
    );
  }
}
