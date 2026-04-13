import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Proposed Schema for Supabase (Execute this in Supabase SQL Editor):
 * 
 * CREATE TABLE demos (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   slug TEXT UNIQUE NOT NULL,
 *   title TEXT NOT NULL,
 *   description TEXT,
 *   icon TEXT,
 *   tag TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE TABLE transcription_logs (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   demo_slug TEXT NOT NULL,
 *   filename TEXT,
 *   content TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */
