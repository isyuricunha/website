export interface LinkType {
  link: string;
  id: string;
  name: string;
  label?: string;
  favourite?: boolean;
  date: Date;
}

export const links: LinkType[] = [
  {
    id: 'squoosh',
    link: 'https://squoosh.app/',
    name: 'Squoosh',
    label: 'Image Compression',
    date: new Date('2022-10-22'),
  },
  {
    id: 'shapedivider',
    link: 'https://www.shapedivider.app/',
    name: 'Shape Divider',
    label: 'Generate SVG section dividers.',
    date: new Date('2022-10-22'),
  },
  {
    id: 'haikei.app',
    favourite: true,
    link: 'https://haikei.app/',
    name: 'Haikei',
    label: 'Design generators',
    date: new Date('2022-10-22'),
  },
  {
    id: 'conic.css',
    link: 'https://www.conic.style/',
    name: 'Conic.CSS',
    label: 'Gradient presets',
    date: new Date('2022-10-22'),
  },
  {
    id: "avataaarsgenerator",
    link: "https://getavataaars.com/",
    name: "Avataaars generator",
    label: "Avatar Generator",
    date: new Date("2022-10-22"),
  },
  {
    id: "draftbit",
    link: "https://personas.draftbit.com/",
    name: "Draft Bit",
    label: "Avatar Generator",
    date: new Date("2022-10-22"),
  },
  {
    id: "opendoodles",
    link: "https://www.opendoodles.com/",
    name: "Open Doodles",
    label: "Free Illustrations",
    date: new Date("2022-10-22"),
  },
  {
    id: "humaaans",
    link: "https://www.humaaans.com/",
    name: "Humaaans",
    label: "Free Illustrations",
    date: new Date("2022-10-22"),
  },
  {
    id: "manypixels",
    link: "https://www.manypixels.co/gallery",
    name: "Manypixels",
    label: "Free Illustrations",
    date: new Date("2022-10-22"),
  },
  {
    id: "illustrations",
    link: "https://illlustrations.co/",
    name: "Illustrations",
    label: "Free Illustrations",
    date: new Date("2022-10-22"),
  },
  {
    id: "isometric",
    link: "https://isometric.online/",
    name: "Isometric",
    label: "Free Illustrations",
    date: new Date("2022-10-22"),
  },
  {
    id: "undraw",
    link: "https://undraw.co/illustrations",
    name: "unDraw",
    label: "Free Illustrations",
    date: new Date("2022-10-22"),
  },
  {
    id: "nextjs",
    link: "https://nextjs.org/",
    name: "Next.JS",
    label: "Web Development",
    date: new Date("2022-10-22"),
  },
  {
    id: "chakra-ui",
    link: "https://chakra-ui.com/",
    name: "Chakra-UI",
    label: "Web Development",
    date: new Date("2022-10-22"),
  },
];

export default links;
