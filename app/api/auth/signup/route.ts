import { NextRequest, NextResponse } from "next/server"
import { signupAction } from "@/app/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const formData = new FormData()
    
    formData.append("name", body.name)
    formData.append("email", body.email)
    formData.append("password", body.password)

    const result = await signupAction({}, formData)

    if (result.success) {
      return NextResponse.json({ success: true, message: "Account created successfully" })
    } else {
      return NextResponse.json(
        { error: result.error || "Signup failed", fieldErrors: result.fieldErrors },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}
