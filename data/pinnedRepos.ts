export const pinnedRepos: pinnedRepoType[] = [
  {
    image:
      'https://raw.githubusercontent.com/isyuricunha/website/main/public/static/images/forDemo/massage-alternativa.png',
    name: 'Massage Alternativa',
    deployedLink: 'https://massagealternativa.com',
    stack: ['HTML', 'CSS', 'JavaScript'],
    id: 'massage-alternativa',
    longDescription:
      'A website for a massage therapist. It was built using HTML, CSS and JavaScript. It is fully responsive and has a contact form. SQL Server, Linux and Firebase in backend.',
  },
  {
    id: 'website',
    stack: ['Next.JS', 'Chakra-UI', 'MDX'],
    name: 'My Website',
    deployedLink: 'https://yuricunha.com',
    image:
      'https://raw.githubusercontent.com/isyuricunha/website/main/public/static/images/forDemo/website-demo.png',
    longDescription:
      "I was looking through Lee Rob's and Daniel Wirtz's websites one afternoon, and decided I need one for myself (you might see a few similarities 🙃 ). I learnt a lot about NextJS and Chakra, and had a great time making it.",
  },
  {
    id: 'solution-system-autmation',
    stack: ['HTML', 'CSS', 'JavaScript'],
    name: 'System Solution Automation',
    deployedLink: 'https://www.ssautomation.com.br/',
    image:
      'https://raw.githubusercontent.com/isyuricunha/website/main/public/static/images/forDemo/ssautomation.png',
    longDescription:
      'A website for a ssautomation. It was built using HTML, CSS and JavaScript. It is fully responsive and has a contact form. SQL Server, Linux and Firebase in backend.',
  },
  {
    id: 'rain-for-relax',
    stack: ['HTML', 'CSS', 'JavaScript'],
    name: 'Rain for relax',
    deployedLink: 'https://www.rain-for-relax.yuricunha.com/',
    image:
      'https://raw.githubusercontent.com/isyuricunha/website/42f264115965e0e0abbd4e19c28cb7873eb18382/public/static/images/forDemo/rain-for-relax.png',
    longDescription: 'A simple website with rain sound to relax.',
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
