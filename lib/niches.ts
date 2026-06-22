/**
 * The canonical content-niche taxonomy. Shared so the values stored on
 * `creator_profiles.niche` (set at onboarding) match the `campaigns.categories`
 * a brand picks in the wizard — that match is what powers niche-based campaign
 * filtering on the creator side.
 */
export const NICHES = [
  "Lifestyle",
  "Gaming",
  "Fashion",
  "Tech",
  "Food",
  "Travel",
  "Fitness",
  "Beauty",
  "Finance",
  "Education",
] as const;

export type Niche = (typeof NICHES)[number];
