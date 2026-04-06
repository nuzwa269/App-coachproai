export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      saved_outputs: {
        Row: SavedOutput;
        Insert: SavedOutputInsert;
        Update: SavedOutputUpdate;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: ChatMessageInsert;
        Update: ChatMessageUpdate;
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  ai_messages_used: number;
  ai_messages_limit: number;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> &
  Partial<Pick<Profile, "created_at" | "updated_at">>;

export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "created_at" | "updated_at">
> &
  Partial<Pick<Profile, "updated_at">>;

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tech_stack: string[] | null;
  status: "active" | "archived" | "completed";
  created_at: string;
  updated_at: string;
}

export type ProjectInsert = Omit<
  Project,
  "id" | "created_at" | "updated_at"
> &
  Partial<Pick<Project, "id" | "created_at" | "updated_at">>;

export type ProjectUpdate = Partial<
  Omit<Project, "id" | "user_id" | "created_at" | "updated_at">
> &
  Partial<Pick<Project, "updated_at">>;

// ─── Saved Outputs ────────────────────────────────────────────────────────────

export interface SavedOutput {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  content: string;
  category: "overview" | "database" | "api" | "docs" | "general";
  assistant_type: string | null;
  created_at: string;
  updated_at: string;
}

export type SavedOutputInsert = Omit<
  SavedOutput,
  "id" | "created_at" | "updated_at"
> &
  Partial<Pick<SavedOutput, "id" | "created_at" | "updated_at">>;

export type SavedOutputUpdate = Partial<
  Omit<
    SavedOutput,
    "id" | "project_id" | "user_id" | "created_at" | "updated_at"
  >
> &
  Partial<Pick<SavedOutput, "updated_at">>;

// ─── Chat Messages ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  project_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  assistant_type: string | null;
  created_at: string;
}

export type ChatMessageInsert = Omit<ChatMessage, "id" | "created_at"> &
  Partial<Pick<ChatMessage, "id" | "created_at">>;

export type ChatMessageUpdate = Partial<
  Omit<ChatMessage, "id" | "project_id" | "user_id" | "created_at">
>;
