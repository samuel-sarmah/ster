"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface TestimonialBasicGridItem {
  id?: string;
  name: string;
  avatar: string;
  content: string;
  role?: string;
  username?: string;
  date?: string;
  link?: string;
  icon?: string;
}

interface TestimonialBasicGridProps {
  heading: string;
  description: string;
  testimonials: TestimonialBasicGridItem[];
  className?: string;
}

interface Testimonial8Props extends TestimonialBasicGridProps {}
type Props = Partial<Testimonial8Props>;

const defaultProps: Testimonial8Props = {
  heading: "Testimonials",
  description:
    "Hear from our happy clients about their experience with our products and services.",
  testimonials: [
    {
      id: "1",
      name: "Sarah Chen",
      username: "sarahchen",
      date: "2024-02-12",
      role: "CEO & Founder",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar3.jpg",
      content:
        "This component library has completely transformed how we build products. We shipped our entire customer-facing dashboard in half the time it would have taken with our old workflow, and the design consistency across every page was noticeably better.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/x-icon.svg",
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      username: "marcusr",
      date: "2024-02-10",
      role: "CTO",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar7.jpg",
      content:
        "The attention to accessibility and performance is outstanding. Our Lighthouse scores improved by 15 points across the board after we migrated, and we passed our first external accessibility audit with zero critical issues. I was skeptical at first, but the quality of the underlying markup convinced me within a week.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/linkedin-icon.svg",
    },
    {
      id: "3",
      name: "Emily Watson",
      username: "emilywatson",
      date: "2024-02-08",
      role: "Head of Product",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar12.jpg",
      content:
        "Finally, a design system that developers actually want to use. The documentation is clear, the components are flexible, and the defaults are sensible.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/x-icon.svg",
    },
    {
      id: "4",
      name: "David Kim",
      username: "davidkim",
      date: "2024-02-05",
      role: "Tech Lead",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar18.jpg",
      content:
        "We evaluated five UI libraries over two quarters before settling on this one. What set it apart was the balance between opinionated defaults and customization flexibility. Every component felt production-ready out of the box.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg",
    },
    {
      id: "5",
      name: "Rachel Foster",
      username: "rachelf",
      date: "2024-02-01",
      role: "Senior Designer",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar22.jpg",
      content:
        "As a designer, I appreciate how closely the components match our Figma designs. The design-to-dev handoff has never been smoother. Every pixel is intentional, and the spacing system makes it easy to maintain visual consistency across dozens of screens without constant back-and-forth.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/facebook-icon.svg",
    },
    {
      id: "6",
      name: "James Mitchell",
      username: "jamesm",
      date: "2024-01-28",
      role: "Full Stack Developer",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar25.jpg",
      content:
        "The TypeScript support is best-in-class. Autocomplete just works, prop types catch mistakes before they hit production, and the DX is genuinely enjoyable. I used to dread building forms and data tables — now they take a fraction of the time. The generics on the table component alone are worth the switch.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/x-icon.svg",
    },
    {
      id: "7",
      name: "Nina Patel",
      username: "ninapatel",
      date: "2024-01-22",
      role: "UX Engineer",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar8.jpg",
      content:
        "These components handle edge cases I didn't even think to test for. Dark mode, RTL support, keyboard navigation, screen reader announcements — it's all built in from the start. We used to spend the last two weeks of every release cycle patching accessibility bugs. That just doesn't happen anymore.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/linkedin-icon.svg",
    },
    {
      id: "8",
      name: "Alex Thompson",
      username: "alext",
      date: "2024-01-18",
      role: "Engineering Manager",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar15.jpg",
      content:
        "Our team's velocity increased measurably after adopting this library. Less time on UI boilerplate means more time on the features our customers actually care about.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/x-icon.svg",
    },
    {
      id: "9",
      name: "Henry Garcia",
      username: "henryg",
      date: "2023-08-25",
      role: "Product Lead",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/avatars/avatar20.jpg",
      content:
        "We rebuilt our entire onboarding flow using these blocks and launched it in under three weeks. The animation primitives gave us polished micro-interactions without pulling in a separate motion library, and the responsive behavior just worked on every breakpoint we tested. Our activation rate is up 20% since the redesign, and I'm confident the UI quality played a big part in that.",
      link: "#",
      icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg",
    },
  ],
};

const COLUMN_DURATIONS = [28, 22, 25];

const TestimonialCard = ({ testimonial }: { testimonial: TestimonialBasicGridItem }) => (
  <Card className="border border-white/10 bg-white/5 p-5 shrink-0 hover:translate-y-0 hover:shadow-none">
    <div className="flex gap-4 leading-5">
      <Avatar className="size-10 rounded-full ring-1 ring-white/20">
        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
      </Avatar>
      <div className="mb-2 text-sm">
        <p className="font-bold text-white">{testimonial.name}</p>
        <p className="text-white/50">{testimonial.role}</p>
      </div>
    </div>
    <div className="mt-1 leading-7 text-white/70">
      <q>{testimonial.content}</q>
    </div>
  </Card>
);

const Testimonial8 = (props: Props) => {
  const { heading, testimonials, className } = {
    ...defaultProps,
    ...props,
  };

  const list = testimonials.slice(0, 6);

  const columns = [
    [list[0], list[3]].filter(Boolean),
    [list[1], list[4]].filter(Boolean),
    [list[2], list[5]].filter(Boolean),
  ];

  return (
    <section className={cn("section-dark section-padding overflow-hidden", className)}>
      <div className="w-4/5 mx-auto">
        <div className="flex flex-col items-start gap-3 md:items-center">
          <h2 className="max-w-3xl text-balance text-2xl font-black tracking-[-0.03em] sm:text-3xl md:text-center lg:text-4xl">
            {heading}
          </h2>
        </div>

        <div
          className="relative mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-hidden"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
          }}
        >
          {columns.map((items, colIdx) => (
            <div
              key={colIdx}
              className={cn(
                "flex flex-col gap-4",
                colIdx === 1 && "hidden sm:flex",
                colIdx === 2 && "hidden lg:flex",
                "animate-scroll-up",
              )}
              style={{ "--scroll-duration": `${COLUMN_DURATIONS[colIdx]}s` } as React.CSSProperties}
            >
              {[...items, ...items].map((t, i) => (
                <TestimonialCard key={i} testimonial={t} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Testimonial8 };
