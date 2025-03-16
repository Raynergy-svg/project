"use client";

// Simple re-export of AuthContext
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/contexts/AuthContext";

export { AuthProvider, useAuth };
export type { UserProfile };
export default AuthProvider;
