export const pinnedRepos: pinnedRepoType[] = [
  {
    image:
      'www.old-website-second-version.yuricunha.xyz/projects/massage-alternativa.png',
    name: 'Massage Alternativa',
    stack: ['HTML', 'CSS', 'JavaScript'],
    id: 'massage-alternativa',
    longDescription:
      'A website for a massage therapist. It was built using HTML, CSS and JavaScript. It is fully responsive and has a contact form. No have a backend.',
  },
  {
    id: `mikebot`,
    name: `MikeBot`,
    stack: ['Discord.JS', 'Node'],
    longDescription: `I wanted to learn how to use JavaScript and this project helped me dive into it. MikeBot utilised the discord API via discord.js to perform a variety of tasks from moderation, games, and general fun. I spent ages over quarantine on this project, and is where I started learning JS.`,
  },

  {
    id: `yuricunha.xyz`,
    stack: ['Next.JS', 'Chakra-UI', 'MDX'],
    name: `My Website`,
    deployedLink: 'https://yuricunha.xyz',
    image:
      'https://user-images.githubusercontent.com/47287285/126173254-b30cafad-d757-4f5e-9a4e-f2c89b3657b2.png',
    longDescription: `I was looking through Lee Rob's and Daniel Wirtz's websites one afternoon, and decided I need one for myself (you might see a few similarities 🙃 ). I learnt a lot about NextJS and Chakra, and had a great time making it.`,
  },
  {
    id: `scuffedmdb`,
    stack: ['Next.JS', 'Chakra-UI'],
    name: `ScuffedMDB`,
    deployedLink: 'https://smdb.yuricunha.xyz',
    image:
      'https://user-images.githubusercontent.com/47287285/125026394-616c8300-e07c-11eb-9678-a6e497119b7d.png',
    longDescription: `I built the first version of this website during the latter half of quarantine to rate movies that my friends and I had watched over discord. Then decided it needed a remodel, and created ScuffedMDB (Movie-rating V2.0), made with NextJS and ChakraUI. It has been great to make a website, that not only all my friends can use, but other people can use (and have :)) for their own movie rating sites.`,
  },
];

export interface pinnedRepoType {
  id: string;
  name: string;
  image?: string;
  deployedLink?: string;
  longDescription: string;
  stack?: string[];
}
