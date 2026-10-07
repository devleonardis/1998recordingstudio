/** The site is a record: every page is a track, blog articles are bonus tracks. */

export type Track = {
  no: string;
  title: string;
  href: string;
  /** Nominal runtime in seconds — scrolling the page plays through it. */
  duration: number;
  bonus?: boolean;
};

export type BonusSource = { slug: string; title: string; readingTime: string };

export const ALBUM_TITLE = "19.98";
export const ALBUM_ARTIST = "19.98 Recording Studio";

export const MAIN_TRACKS: Track[] = [
  { no: "01", title: "Intro", href: "/", duration: 222 },
  { no: "02", title: "Lo Studio", href: "/studio-registrazione-bari", duration: 198 },
  { no: "03", title: "Produzione", href: "/produzione-musicale", duration: 185 },
  { no: "04", title: "Mix & Master", href: "/mix-master", duration: 178 },
  { no: "05", title: "Il Blog", href: "/blog", duration: 151 },
];

export function buildAlbum(bonus: BonusSource[]): Track[] {
  return [
    ...MAIN_TRACKS,
    ...bonus.map((post, i) => ({
      no: `B${i + 1}`,
      title: post.title.split(":")[0],
      href: `/blog/${post.slug}`,
      duration: (parseInt(post.readingTime, 10) || 4) * 60,
      bonus: true,
    })),
  ];
}

export function formatTime(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
