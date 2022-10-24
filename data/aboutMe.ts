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
    return: '"Kent, UK"',
  },

  {
    input: 'self.interests',
    return: '["web dev", "biology", "tennis"]',
  },
  {
    input: 'self.education',
    return: '"B.Sc Biochemistry - University of Kent"',
  },
  {
    input: 'self.skills',
    return:
      '[ "JavaScript", "Python", "React", "Next.JS", "Chakra-UI", "Tailwind", "SASS", "git"]',
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
