import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          text: string;
          description: string | null;
          completed: boolean;
          priority: 'low' | 'medium' | 'high';
          scheduled_for: string | null;
          estimated_hours: number | null;
          category_id: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          description?: string | null;
          completed?: boolean;
          priority?: 'low' | 'medium' | 'high';
          scheduled_for?: string | null;
          estimated_hours?: number | null;
          category_id?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          description?: string | null;
          completed?: boolean;
          priority?: 'low' | 'medium' | 'high';
          scheduled_for?: string | null;
          estimated_hours?: number | null;
          category_id?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}