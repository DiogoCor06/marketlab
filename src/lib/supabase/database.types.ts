export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ledger_entries: {
        Row: {
          amount_cents: number;
          created_at: string;
          description: string | null;
          entry_type: string;
          id: string;
          market_id: string | null;
          user_id: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          description?: string | null;
          entry_type: string;
          id?: string;
          market_id?: string | null;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          description?: string | null;
          entry_type?: string;
          id?: string;
          market_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_entries_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      markets: {
        Row: {
          close_date: string;
          created_at: string;
          description: string;
          id: string;
          status: "open" | "closed" | "resolved";
          title: string;
          updated_at: string;
        };
        Insert: {
          close_date: string;
          created_at?: string;
          description?: string;
          id?: string;
          status?: "open" | "closed" | "resolved";
          title: string;
          updated_at?: string;
        };
        Update: {
          close_date?: string;
          created_at?: string;
          description?: string;
          id?: string;
          status?: "open" | "closed" | "resolved";
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      positions: {
        Row: {
          created_at: string;
          id: string;
          market_id: string;
          no_shares_cents: number;
          updated_at: string;
          user_id: string;
          yes_shares_cents: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          market_id: string;
          no_shares_cents?: number;
          updated_at?: string;
          user_id: string;
          yes_shares_cents?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          market_id?: string;
          no_shares_cents?: number;
          updated_at?: string;
          user_id?: string;
          yes_shares_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "positions_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "positions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          balance_cents: number;
          created_at: string;
          first_name: string;
          id: string;
          last_name: string;
          updated_at: string;
        };
        Insert: {
          balance_cents?: number;
          created_at?: string;
          first_name?: string;
          id: string;
          last_name?: string;
          updated_at?: string;
        };
        Update: {
          balance_cents?: number;
          created_at?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      marketlab_starting_balance_cents: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
