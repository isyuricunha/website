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
    link: 'https://squoosh.app/?utm_source=yuricunha.com',
    name: 'Squoosh',
    label: 'Image Compression',
    date: new Date('2022-10-22'),
  },
  {
    id: 'shapedivider',
    link: 'https://www.shapedivider.app/?utm_source=yuricunha.com',
    name: 'Shape Divider',
    label: 'Generate SVG section dividers.',
    date: new Date('2022-10-22'),
  },
  {
    id: 'haikei.app',
    favourite: true,
    link: 'https://haikei.app/?utm_source=yuricunha.com',
    name: 'Haikei',
    label: 'Design generators',
    date: new Date('2022-10-22'),
  },
  {
    id: 'conic.css',
    link: 'https://www.conic.style/?utm_source=yuricunha.com',
    name: 'Conic.CSS',
    label: 'Gradient presets',
    date: new Date('2022-10-22'),
  },
  {
    id: 'avataaarsgenerator',
    link: 'https://getavataaars.com/?utm_source=yuricunha.com',
    name: 'Avataaars generator',
    label: 'Avatar Generator',
    date: new Date('2022-10-22'),
  },
  {
    id: 'draftbit',
    link: 'https://personas.draftbit.com/?utm_source=yuricunha.com',
    name: 'Draft Bit',
    label: 'Avatar Generator',
    date: new Date('2022-10-22'),
  },
  {
    id: 'opendoodles',
    link: 'https://www.opendoodles.com/?utm_source=yuricunha.com',
    name: 'Open Doodles',
    label: 'Free Illustrations',
    date: new Date('2022-10-22'),
  },
  {
    id: 'humaaans',
    link: 'https://www.humaaans.com/?utm_source=yuricunha.com',
    name: 'Humaaans',
    label: 'Free Illustrations',
    date: new Date('2022-10-22'),
  },
  {
    id: 'manypixels',
    link: 'https://www.manypixels.co/gallery?utm_source=yuricunha.com',
    name: 'Manypixels',
    label: 'Free Illustrations',
    date: new Date('2022-10-22'),
  },
  {
    id: 'illustrations',
    link: 'https://illlustrations.co/?utm_source=yuricunha.com',
    name: 'Illustrations',
    label: 'Free Illustrations',
    date: new Date('2022-10-22'),
  },
  {
    id: 'isometric',
    link: 'https://isometric.online/?utm_source=yuricunha.com',
    name: 'Isometric',
    label: 'Free Illustrations',
    date: new Date('2022-10-22'),
  },
  {
    id: 'undraw',
    link: 'https://undraw.co/illustrations?utm_source=yuricunha.com',
    name: 'unDraw',
    label: 'Free Illustrations',
    date: new Date('2022-10-22'),
  },
  {
    id: 'nextjs',
    link: 'https://nextjs.org/?utm_source=yuricunha.com',
    name: 'Next.JS',
    label: 'Web Development',
    date: new Date('2022-10-22'),
  },
  {
    id: 'chakra-ui',
    link: 'https://chakra-ui.com/?utm_source=yuricunha.com',
    name: 'Chakra-UI',
    label: 'Web Development',
    date: new Date('2022-10-22'),
  },
];

export default links;
