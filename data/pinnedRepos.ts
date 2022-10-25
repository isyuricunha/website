export const pinnedRepos: pinnedRepoType[] = [
  {
    image:
      'https://raw.githubusercontent.com/isyuricunha/website/main/public/static/images/forDemo/massage-alternativa.png?token=GHSAT0AAAAAAB2JNOGCCZIUQ2SCYTP5KC76Y2XZ3EQ',
    name: 'Massage Alternativa',
    deployedLink: 'https://massagealternativa.com',
    stack: ['HTML', 'CSS', 'JavaScript'],
    id: 'massage-alternativa',
    longDescription:
      'A website for a massage therapist. It was built using HTML, CSS and JavaScript. It is fully responsive and has a contact form. No have a backend.',
  },
  {
    id: `website`,
    stack: ['Next.JS', 'Chakra-UI', 'MDX'],
    name: `My Website`,
    deployedLink: 'https://yuricunha.xyz',
    image:
      'https://raw.githubusercontent.com/isyuricunha/website/main/public/static/images/forDemo/website-demo.png?token=GHSAT0AAAAAAB2JNOGCCZIUQ2SCYTP5KC76Y2XZ3EQ',
    longDescription: `I was looking through Lee Rob's and Daniel Wirtz's websites one afternoon, and decided I need one for myself (you might see a few similarities 🙃 ). I learnt a lot about NextJS and Chakra, and had a great time making it.`,
  },
  {
    id: `solution-system-autmation`,
    stack: ['HTML', 'CSS', 'JavaScript'],
    name: `System Solution Automation`,
    deployedLink: 'https://www.ssautomation.com.br/',
    image:
      'https://raw.githubusercontent.com/isyuricunha/website/main/public/static/images/forDemo/ssautomation.png',
    longDescription: `A website for a ssautomation. It was built using HTML, CSS and JavaScript. It is fully responsive and has a contact form. No have a backend.`,
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
