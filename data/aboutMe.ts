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
    return: '["database administrator", "web dev", "anime", "books"]',
  },
  {
    input: 'self.education',
    return: '"Database - University of Estácio de Sá"',
  },
  {
    input: 'self.skills',
    return:
      '["Python", "MySQL", "SQL Server", "JavaScript", "Next.TS", "Tailwind", "git"]',
  },
  {
    input: 'self.contactMe()',
    return: `["<a style="${style(
      props
    )}" rel="noopener" href="https://www.linkedin.com/in/isyuricunha/">LinkedIn</a>", "<a style="${style(
      props
      )}" rel="noopener" href="https://github.com/isyuricunha">Github</a>", "<a rel="noopener" style="${style(
      props
      )}" href="mailto:isyuricunha@duck.com">Email</a>"]`,
  },
];

export default info;
