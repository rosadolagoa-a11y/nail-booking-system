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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'bookings_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
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
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type WorkingHour = Database['public']['Tables']['working_hours']['Row'];
export type BlockedDate = Database['public']['Tables']['blocked_dates']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
