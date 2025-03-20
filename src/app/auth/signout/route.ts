import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    
    return NextResponse.json(
      { success: true, message: "Successfully signed out" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json(
      { success: false, message: "Failed to sign out" },
      { status: 500 }
    );
  }
}

// Also support GET for convenience
export async function GET() {
  // Call the POST handler directly without using 'this'
  return POST();
}
