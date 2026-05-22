// app/actions/auth.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgagfvcujuoujbtmqqom.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYWdmdmN1anVvdWpidG1xcW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTU1MjEsImV4cCI6MjA5NDg3MTUyMX0.mBZ-7vit3ruvRUmwDgM3oF4MkCmkM-pxkJ8ehv-4CFM";

// دالة مساعدة لإنشاء Supabase client مخصص للـ Server Actions يدعم الـ Cookies لحفظ الجلسة
async function getServerSupabase() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  if (accessToken && refreshToken) {
    try {
      await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (e) {
      console.error("Failed to set server auth session from cookies:", e);
    }
  }

  return client;
}

// 1. تسجيل الدخول (Sign In)
export async function signInAction(email: string, password: string) {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      user: data.user,
      session: data.session 
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

// 2. تسجيل حساب جديد (Sign Up)
export async function signUpAction(email: string, password: string, fullName: string) {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          volt_points: 100, // نقاط ترحيبية هدية!
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // إدراج الملف الشخصي في جدول profiles تلقائياً
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          volt_points: 100,
        });
      
      if (profileError) {
        console.error("Failed to create profile record:", profileError.message);
        return { success: false, error: "Failed to initialize profile in database: " + profileError.message };
      }
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

// 3. تسجيل الخروج (Sign Out)
export async function signOutAction() {
  try {
    const supabase = await getServerSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. الحصول على جلب المستخدم الحالي حياً (Get Session User)
export async function getCurrentUserAction() {
  try {
    const supabase = await getServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// 5. الحصول على تفاصيل الملف الشخصي (Get User Profile details)
export async function getUserProfileAction(userId: string) {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching profile details:", err);
    return null;
  }
}
