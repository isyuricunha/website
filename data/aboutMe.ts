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
    return: '"Brazil"',
  },

  {
    input: 'self.interests',
    return: '["database-sql-nosql", "anime", "book", "home-cloud]',
  },
  {
    input: 'self.education',
    return: '"Database Administrator, 2019-2023 && Physics, 2015-2019"',
  },
  {
    input: 'self.skills',
    return: '[ "SQL", "PL/SQL", "NoSQL", "Python", "Home Cloud", "Docker"]',
  },
  {
    input: 'self.contactMe()',
    return: `["<a style="${style(
      props
    )}" rel="noopener" href="https://www.linkedin.com/in/isyuricunha/">LinkedIn</a>", "<a style="${style(
      props
    )}" rel="noopener" href="https://github.com/isyuricunha">Github</a>", "<a rel="noopener" style="${style(
      props
    )}" rel="noopener" href="https://twitter.com/isyuricunha">Twitter/X</a>", "<a rel="noopener" style="${style(
      props
    )}" rel="noopener" href="https://www.instagram.com/isyuricunha/">Instagram</a>", "<a rel="noopener" style="${style(
      props
    )}" rel="noopener" href="https://discordapp.com/channels/@me/1018988240151253002/">Discord</a>", "<a rel="noopener" style="${style(
      props
    )}" href="mailto:isyuricunha@duck.com">Email</a>", "<a rel="noopener" style="${style(
      props
    )}" href="https://mastodon.social/@isyuricunha">Mastodon</a>"]`,
  },
];

export default info;
