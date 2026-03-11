import { NextRequest, NextResponse } from "next/server"
import { loginAction } from "@/app/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const formData = new FormData()
    
    formData.append("email", body.email)
    formData.append("password", body.password)

    const result = await loginAction({}, formData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error || "Login failed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
}
