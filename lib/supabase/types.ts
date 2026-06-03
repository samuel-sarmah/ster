export type UserRole = "creator" | "brand" | "admin";
export type Platform = "tiktok" | "instagram" | "youtube" | "x";
export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type SubmissionStatus = "pending_review" | "approved" | "tracking" | "paid" | "rejected";
export type EarningsStatus = "pending" | "confirmed" | "paid";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          display_name: string | null;
          avatar_url: string | null;
          stripe_account_id: string | null;
          stripe_customer_id: string | null;
          is_suspended: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      brand_profiles: {
        Row: {
          id: string;
          company_name: string;
          website: string | null;
          industry: string | null;
        };
        Insert: Database["public"]["Tables"]["brand_profiles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["brand_profiles"]["Row"]>;
      };
      creator_profiles: {
        Row: {
          id: string;
          bio: string | null;
          niche: string[];
        };
        Insert: Database["public"]["Tables"]["creator_profiles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["creator_profiles"]["Row"]>;
      };
      social_accounts: {
        Row: {
          id: string;
          creator_id: string;
          platform: Platform;
          platform_user_id: string;
          handle: string;
          access_token: string | null;
          refresh_token: string | null;
          token_expires_at: string | null;
          follower_count: number | null;
          is_active: boolean;
          connected_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["social_accounts"]["Row"], "id" | "connected_at">;
        Update: Partial<Database["public"]["Tables"]["social_accounts"]["Insert"]>;
      };
      campaigns: {
        Row: {
          id: string;
          brand_id: string;
          title: string;
          description: string | null;
          guidelines: string | null;
          target_cpm: number;
          total_budget: number;
          spent_budget: number;
          platforms: Platform[];
          content_requirements: string | null;
          status: CampaignStatus;
          stripe_payment_intent_id: string | null;
          escrow_released: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["campaigns"]["Row"], "id" | "spent_budget" | "escrow_released" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
      };
      campaign_applications: {
        Row: {
          id: string;
          campaign_id: string;
          creator_id: string;
          status: ApplicationStatus;
          applied_at: string;
          reviewed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["campaign_applications"]["Row"], "id" | "applied_at">;
        Update: Partial<Database["public"]["Tables"]["campaign_applications"]["Insert"]>;
      };
      submissions: {
        Row: {
          id: string;
          campaign_id: string;
          creator_id: string;
          social_account_id: string;
          platform: Platform;
          post_url: string;
          post_platform_id: string | null;
          status: SubmissionStatus;
          submitted_at: string;
          approved_at: string | null;
          rejection_reason: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["submissions"]["Row"], "id" | "submitted_at">;
        Update: Partial<Database["public"]["Tables"]["submissions"]["Insert"]>;
      };
      view_snapshots: {
        Row: {
          id: string;
          submission_id: string;
          view_count: number;
          fetched_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["view_snapshots"]["Row"], "id" | "fetched_at">;
        Update: never;
      };
      earnings: {
        Row: {
          id: string;
          submission_id: string;
          creator_id: string;
          campaign_id: string;
          verified_views: number;
          amount_usd: number;
          status: EarningsStatus;
          stripe_transfer_id: string | null;
          paid_at: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["earnings"]["Row"], "id" | "verified_views" | "amount_usd" | "status" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["earnings"]["Insert"]>;
      };
      admin_flags: {
        Row: {
          id: string;
          submission_id: string;
          flagged_by: string;
          reason: string;
          resolved: boolean;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admin_flags"]["Row"], "id" | "resolved" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["admin_flags"]["Insert"]>;
      };
    };
  };
}
