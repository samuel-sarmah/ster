import { Hero195, type PixabayVideo } from "@/components/hero195";
import { Pricing11 } from "@/components/pricing11";
import { Testimonial8 } from "@/components/testimonial8";
import { Contact2 } from "@/components/contact2";

async function getCreatorVideos(): Promise<PixabayVideo[]> {
  const key = process.env.NEXT_PUBLIC_PIXABAY_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${key}&q=content+creator&per_page=20&video_type=all`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits ?? []) as PixabayVideo[];
  } catch {
    return [];
  }
}

const testimonials = [
  {
    id: "1",
    name: "Amelia Ward",
    role: "Head of Growth, Beam Brands",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    content:
      "Sterclip gave our team one source of truth for approvals and payout readiness. We stopped reconciling creator spreadsheets manually after the first week.",
  },
  {
    id: "2",
    name: "Kian Morales",
    role: "Creator Partnerships Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    content:
      "Verification snapshots made payout conversations simple. Creators trust the process because they can see exactly how campaign performance maps to earnings.",
  },
  {
    id: "3",
    name: "Nora El-Sayed",
    role: "Operations Manager, BrightCart",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400&auto=format&fit=crop",
    content:
      "We launched across multiple channels without adding extra ops headcount. Sterclip handled queueing, status tracking, and payout flow end to end.",
  },
  {
    id: "4",
    name: "Jalen Brooks",
    role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    content:
      "As a creator, I like knowing funds are escrowed before I publish. It removed uncertainty and helped me prioritize the right partnerships.",
  },
  {
    id: "5",
    name: "Priya Narang",
    role: "Brand Marketing Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    content:
      "Our finance and marketing teams finally work from the same campaign ledger. Visibility into spend and release timing is excellent.",
  },
  {
    id: "6",
    name: "Rafael Costa",
    role: "Campaign Analyst",
    avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=400&auto=format&fit=crop",
    content:
      "The platform made it easy to compare creator cohorts by verified CPM and adjust campaign strategy in real time.",
  },
];

export default async function Home() {
  const creatorVideos = await getCreatorVideos();

  return (
    <main className="bg-background">
      <section id="hero">
        <Hero195
          description="Sterclip helps brands fund escrow-backed campaigns, creators submit confidently, and payouts release only after views are verified."
          primaryButtonText="Start your first campaign"
          primaryButtonUrl="/signup"
          secondaryButtonText="Creator sign in"
          secondaryButtonUrl="/login"
        />
      </section>

      {creatorVideos.length > 0 && (
        <section id="gallery" className="scroll-mt-24 section-padding">
          <div className="container mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-[-0.02em] md:text-4xl lg:text-5xl">
                Creator content in the wild
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground lg:text-lg lg:leading-8">
                Real creator videos from across the community, powered by Pixabay.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {creatorVideos.slice(0, 16).map((video) => (
                <div
                  key={video.id}
                  className="relative aspect-video overflow-hidden rounded-xl border border-border/70 bg-muted shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-soft-hover)]"
                >
                  <video
                    src={video.videos.small?.url || video.videos.medium?.url || video.videos.tiny?.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Videos via Pixabay
            </p>
          </div>
        </section>
      )}

      <section id="pricing" className="scroll-mt-24">
        <Pricing11 className="animate-fade-up" />
      </section>

      <section id="testimonials" className="scroll-mt-24">
        <Testimonial8
          className="animate-fade-up"
          heading="Trusted by brand and creator operations teams"
          description="Teams choose Sterclip when they need transparent workflow, fewer payout disputes, and predictable campaign performance."
          testimonials={testimonials}
        />
      </section>

      <section id="contact" className="scroll-mt-24">
        <Contact2
          className="animate-fade-up"
          title="Plan your rollout with the Sterclip team"
          description="Tell us your campaign volume, target channels, and payout model. We will help you configure onboarding, verification, and settlement flow."
          phone="+1 (555) 010-0240"
          email="hello@sterclip.com"
          web={{ label: "sterclip.com", url: "https://sterclip.com" }}
          formHeading="Talk to Sterclip"
          formSubheading="Share your goals and we will respond within one business day."
          successMessage="Thanks, your request has been received."
          submitLabel="Send request"
          submittingLabel="Sending request..."
        />
      </section>
    </main>
  );
}
