const style = (props) =>
  `color: var(--chakra-colors-brand-${
    props.colorMode === 'light' ? '600' : '300'
  });font-weight: 500;`;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const info = (props: any): { input: string; return: string }[] => [
  {
    input: 'self.learnAboutMe()',
    return: 'Loaded data...',
  },
  {
    input: 'self.currentLocation',
    return: '"São Paulo, BR"',
  },

  {
    input: 'self.interests',
    return: '["database", "mysql", "sql server", "web dev", "anime", "book"]',
  },
  {
    input: 'self.education',
    return: '"Database - Estácio de Sá"',
  },
  {
    input: 'self.skills',
    return:
      '[ "MySQL", "PL/SQL", "NoSQL", "Python", "React", "Next.TS", "Chakra-UI", "Tailwind", "git"]',
  },
  {
    input: 'self.contactMe()',
    return: `["<a style="${style(
      props
    )}" rel="noopener" href="https://www.linkedin.com/in/isyuricunha/">LinkedIn</a>", "<a style="${style(
      props
      )}" rel="noopener" href="https://github.com/isyuricunha">Github</a>", "<a rel="noopener" style="${style(
      props
      )}" rel="noopener" href="https://twitter.com/isyuricunha">Twitter</a>", "<a rel="noopener" style="${style(
        props
      )}" rel="noopener" href="https://www.instagram.com/isyuricunha/">Instagram</a>", "<a rel="noopener" style="${style(
        props
      )}" rel="noopener" href="https://discordapp.com/users/1018988240151253002">Discord</a>", "<a rel="noopener" style="${style(
        props
      )}" href="mailto:isyuricunha@duck.com">Email</a>"]`,
  },
];

export default info;
