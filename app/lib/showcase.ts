/**
 * showcase.ts — generated manifest for the Autonomous Finishing showcase.
 * 80 concept renders across two series. Regenerate with scripts/build-showcase.mjs.
 * HONESTY: concept renders / design targets, not deployed hardware. See README.
 */

export type SeriesId = "independent" | "field";

export interface Series {
  id: SeriesId;
  name: string;
  tagline: string;
  description: string;
}

export const SERIES: Series[] = [
  {
    id: "independent",
    name: "Independent Operation",
    tagline: "The finishing robot working the wall on its own",
    description:
      "The core DryForge unit — a mobile base and collaborative arm running the finishing sequence (taping, mudding, sanding) under supervision on real interior geometry.",
  },
  {
    id: "field",
    name: "Systems & Field Views",
    description:
      "The wider platform in context: surface scanning, operator supervision, and multiple chassis working across corridors, openings and full-height walls.",
    tagline: "The platform on an active jobsite",
  },
];

export interface ShowcaseImage { src: string; series: SeriesId; }

export const IMAGES: ShowcaseImage[] = [
  { src: "/showcase/independent/01.png", series: "independent" },
  { src: "/showcase/independent/02.png", series: "independent" },
  { src: "/showcase/independent/03.png", series: "independent" },
  { src: "/showcase/independent/04.png", series: "independent" },
  { src: "/showcase/independent/05.png", series: "independent" },
  { src: "/showcase/independent/06.png", series: "independent" },
  { src: "/showcase/independent/07.png", series: "independent" },
  { src: "/showcase/independent/08.png", series: "independent" },
  { src: "/showcase/independent/09.png", series: "independent" },
  { src: "/showcase/independent/10.png", series: "independent" },
  { src: "/showcase/independent/11.png", series: "independent" },
  { src: "/showcase/independent/12.png", series: "independent" },
  { src: "/showcase/independent/13.png", series: "independent" },
  { src: "/showcase/independent/14.png", series: "independent" },
  { src: "/showcase/independent/15.png", series: "independent" },
  { src: "/showcase/independent/16.png", series: "independent" },
  { src: "/showcase/independent/17.png", series: "independent" },
  { src: "/showcase/independent/18.png", series: "independent" },
  { src: "/showcase/independent/19.png", series: "independent" },
  { src: "/showcase/independent/20.png", series: "independent" },
  { src: "/showcase/independent/21.png", series: "independent" },
  { src: "/showcase/independent/22.png", series: "independent" },
  { src: "/showcase/independent/23.png", series: "independent" },
  { src: "/showcase/independent/24.png", series: "independent" },
  { src: "/showcase/independent/25.png", series: "independent" },
  { src: "/showcase/independent/26.png", series: "independent" },
  { src: "/showcase/independent/27.png", series: "independent" },
  { src: "/showcase/independent/28.png", series: "independent" },
  { src: "/showcase/independent/29.png", series: "independent" },
  { src: "/showcase/independent/30.png", series: "independent" },
  { src: "/showcase/independent/31.png", series: "independent" },
  { src: "/showcase/independent/32.png", series: "independent" },
  { src: "/showcase/independent/33.png", series: "independent" },
  { src: "/showcase/independent/34.png", series: "independent" },
  { src: "/showcase/independent/35.png", series: "independent" },
  { src: "/showcase/independent/36.png", series: "independent" },
  { src: "/showcase/independent/37.png", series: "independent" },
  { src: "/showcase/independent/38.png", series: "independent" },
  { src: "/showcase/independent/39.png", series: "independent" },
  { src: "/showcase/independent/40.png", series: "independent" },
  { src: "/showcase/field/01.png", series: "field" },
  { src: "/showcase/field/02.png", series: "field" },
  { src: "/showcase/field/03.png", series: "field" },
  { src: "/showcase/field/04.png", series: "field" },
  { src: "/showcase/field/05.png", series: "field" },
  { src: "/showcase/field/06.png", series: "field" },
  { src: "/showcase/field/07.png", series: "field" },
  { src: "/showcase/field/08.png", series: "field" },
  { src: "/showcase/field/09.png", series: "field" },
  { src: "/showcase/field/10.png", series: "field" },
  { src: "/showcase/field/11.png", series: "field" },
  { src: "/showcase/field/12.png", series: "field" },
  { src: "/showcase/field/13.png", series: "field" },
  { src: "/showcase/field/14.png", series: "field" },
  { src: "/showcase/field/15.png", series: "field" },
  { src: "/showcase/field/16.png", series: "field" },
  { src: "/showcase/field/17.png", series: "field" },
  { src: "/showcase/field/18.png", series: "field" },
  { src: "/showcase/field/19.png", series: "field" },
  { src: "/showcase/field/20.png", series: "field" },
  { src: "/showcase/field/21.png", series: "field" },
  { src: "/showcase/field/22.png", series: "field" },
  { src: "/showcase/field/23.png", series: "field" },
  { src: "/showcase/field/24.png", series: "field" },
  { src: "/showcase/field/25.png", series: "field" },
  { src: "/showcase/field/26.png", series: "field" },
  { src: "/showcase/field/27.png", series: "field" },
  { src: "/showcase/field/28.png", series: "field" },
  { src: "/showcase/field/29.png", series: "field" },
  { src: "/showcase/field/30.png", series: "field" },
  { src: "/showcase/field/31.png", series: "field" },
  { src: "/showcase/field/32.png", series: "field" },
  { src: "/showcase/field/33.png", series: "field" },
  { src: "/showcase/field/34.png", series: "field" },
  { src: "/showcase/field/35.png", series: "field" },
  { src: "/showcase/field/36.png", series: "field" },
  { src: "/showcase/field/37.png", series: "field" },
  { src: "/showcase/field/38.png", series: "field" },
  { src: "/showcase/field/39.png", series: "field" },
  { src: "/showcase/field/40.png", series: "field" },
];

