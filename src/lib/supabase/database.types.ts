/**
 * Generated from Supabase schema — regenerate via MCP `generate_typescript_types`
 * when tables change.
 */

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
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          invite_code: string;
          provider: "device" | "apple" | "google" | "email";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          invite_code?: string;
          provider?: "device" | "apple" | "google" | "email";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          invite_code?: string;
          provider?: "device" | "apple" | "google" | "email";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stomped_tiles: {
        Row: {
          user_id: string;
          h3_index: string;
          first_stomped_at: string;
          visit_count: number;
          last_stomped_at: string;
        };
        Insert: {
          user_id: string;
          h3_index: string;
          first_stomped_at?: string;
          visit_count?: number;
          last_stomped_at?: string;
        };
        Update: {
          user_id?: string;
          h3_index?: string;
          first_stomped_at?: string;
          visit_count?: number;
          last_stomped_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      neighborhood_stats: {
        Row: {
          user_id: string;
          neighborhood_key: string;
          display_label: string | null;
          stomped_count: number;
          total_cells: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          neighborhood_key: string;
          display_label?: string | null;
          stomped_count?: number;
          total_cells?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          neighborhood_key?: string;
          display_label?: string | null;
          stomped_count?: number;
          total_cells?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      send_friend_invite: {
        Args: { target_invite_code: string };
        Returns: Database["public"]["Tables"]["friendships"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
