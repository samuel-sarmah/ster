import type { Platform } from "@/lib/supabase/types";

export interface SocialAdapter {
  fetchViews(postId: string, accessToken: string): Promise<number>;
  extractPostId(postUrl: string): string | null;
  getOAuthUrl(state: string, redirectUri: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    user_id: string;
    handle: string;
    follower_count?: number;
  }>;
  refreshToken?(refreshToken: string): Promise<{
    access_token: string;
    expires_in?: number;
  }>;
}

// Stub adapters — replace with real API calls once credentials are available

export const tiktokAdapter: SocialAdapter = {
  fetchViews: async (postId, _token) => {
    try {
      // TikTok Video API v2
      const res = await fetch(
        `https://open.tiktokapis.com/v2/video/query/?fields=id,statistics`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filters: { video_ids: [postId] } }),
        }
      );
      const data = await res.json();
      return data?.data?.videos?.[0]?.statistics?.play_count ?? 0;
    } catch (err) {
      throw new Error(`[tiktok] fetchViews failed for post ${postId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
  extractPostId: (url) => {
    const match = url.match(/video\/(\d+)/);
    return match?.[1] ?? null;
  },
  getOAuthUrl: (state, redirectUri) => {
    const params = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      scope: "user.info.basic,video.list",
      response_type: "code",
      redirect_uri: redirectUri,
      state,
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
  },
  exchangeCode: async (code, redirectUri) => {
    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user_id: data.open_id,
      handle: data.open_id,
    };
  },
};

export const instagramAdapter: SocialAdapter = {
  fetchViews: async (postId, token) => {
    try {
      const res = await fetch(
        `https://graph.instagram.com/${postId}?fields=video_views,plays&access_token=${token}`
      );
      const data = await res.json();
      return data.video_views ?? data.plays ?? 0;
    } catch (err) {
      throw new Error(`[instagram] fetchViews failed for post ${postId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
  extractPostId: (url) => {
    const match = url.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    return match?.[1] ?? null;
  },
  getOAuthUrl: (state, redirectUri) => {
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID!,
      redirect_uri: redirectUri,
      scope: "instagram_basic,instagram_content_publish",
      response_type: "code",
      state,
    });
    return `https://api.instagram.com/oauth/authorize?${params}`;
  },
  exchangeCode: async (code, redirectUri) => {
    const res = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });
    const data = await res.json();
    return {
      access_token: data.access_token,
      user_id: String(data.user_id),
      handle: String(data.user_id),
    };
  },
};

export const youtubeAdapter: SocialAdapter = {
  fetchViews: async (videoId, _token) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      return parseInt(data.items?.[0]?.statistics?.viewCount ?? "0", 10);
    } catch (err) {
      throw new Error(`[youtube] fetchViews failed for video ${videoId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
  extractPostId: (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match?.[1] ?? null;
  },
  getOAuthUrl: (state, redirectUri) => {
    const params = new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      state,
    });
    return `https://accounts.google.com/o/oauth2/auth?${params}`;
  },
  exchangeCode: async (code, redirectUri) => {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID ?? "",
        client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    // Fetch channel info
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
      { headers: { Authorization: `Bearer ${data.access_token}` } }
    );
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user_id: channel?.id ?? "",
      handle: channel?.snippet?.title ?? "",
      follower_count: parseInt(channel?.statistics?.subscriberCount ?? "0", 10),
    };
  },
};

export const xAdapter: SocialAdapter = {
  fetchViews: async (tweetId, token) => {
    try {
      const res = await fetch(
        `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      return data.data?.public_metrics?.impression_count ?? 0;
    } catch (err) {
      throw new Error(`[x] fetchViews failed for tweet ${tweetId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
  extractPostId: (url) => {
    const match = url.match(/status\/(\d+)/);
    return match?.[1] ?? null;
  },
  getOAuthUrl: (state, redirectUri) => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.X_API_KEY!,
      redirect_uri: redirectUri,
      scope: "tweet.read users.read offline.access",
      state,
      code_challenge: "challenge",
      code_challenge_method: "plain",
    });
    return `https://twitter.com/i/oauth2/authorize?${params}`;
  },
  exchangeCode: async (code, redirectUri) => {
    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.X_API_KEY}:${process.env.X_API_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: "challenge",
      }),
    });
    const data = await res.json();
    const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=public_metrics", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const userData = await userRes.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user_id: userData.data?.id ?? "",
      handle: userData.data?.username ?? "",
      follower_count: userData.data?.public_metrics?.followers_count ?? 0,
    };
  },
};

const ADAPTERS: Record<Platform, SocialAdapter> = {
  tiktok: tiktokAdapter,
  instagram: instagramAdapter,
  youtube: youtubeAdapter,
  x: xAdapter,
};

export function getAdapter(platform: Platform): SocialAdapter {
  return ADAPTERS[platform];
}
