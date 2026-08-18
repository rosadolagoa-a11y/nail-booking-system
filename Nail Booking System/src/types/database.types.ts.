export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'designer' | 'client';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          name: string;
          email: string;
          password_hash: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: never;
          name: string;
          email: string;
          password_hash: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          password_hash?: string;
          role?: UserRole;
        };
      };
      services: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      working_hours: {
        Row: {
          id: number;
          day_of_week: number;
          start_time: string | null;
          end_time: string | null;
          is_closed: boolean;
        };
        Insert: {
          id?: never;
          day_of_week: number;
          start_time?: string | null;
          end_time?: string | null;
          is_closed?: boolean;
        };
        Update: {
          day_of_week?: number;
          start_time?: string | null;
          end_time?: string | null;
          is_closed?: boolean;
        };
      };
      blocked_dates: {
        Row: {
          id: number;
          blocked_date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          blocked_date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          blocked_date?: string;
          reason?: string | null;
        };
      };
      bookings: {
        Row: {
          id: number;
          client_id: number;
          service_id: number;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: BookingStatus;
          booking_period?: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          client_id: number;
          service_id: number;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: number;
          service_id?: number;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: BookingStatus;
          updated_at?: string;
        };
      };
    };
    Functions: {
      verify_user_password: {
        Args: {
          p_email: string;
          p_password: string;
        };
        Returns: {
          user_id: number;
          name: string;
          email: string;
          role: UserRole;
        }[];
      };
    };
  };
}
