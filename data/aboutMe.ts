import { t } from 'i18next';

const style = (props) =>
  `color: var(--chakra-colors-brand-${
    props.colorMode === 'light' ? '600' : '300'
  });font-weight: 500;`;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const info = (props: any): { input: string; return: string }[] => [
  {
    input: t('self.learnAboutMe'),
    return: t('loadedData'),
  },
  {
    input: t('self.currentLocation'),
    return: '"Brazil"',
  },

  {
    input: t('self.interests'),
    return: '["database-sql-nosql", "anime", "book", "home-cloud]',
  },
  {
    input: t('self.education'),
    return: '"Database Administrator, 2019-2023 && Physics, 2015-2019"',
  },
  {
    input: t('self.skills'),
    return: '[ "SQL", "PL/SQL", "NoSQL", "Python", "Home Cloud", "Docker"]',
  },
  {
    input: t('self.contactMe'),
    return: `["<a style="${style(
      props
    )}" rel="noopener" href="https://www.linkedin.com/in/isyuricunha/">LinkedIn</a>", "<a style="${style(
      props
    )}" rel="noopener" href="https://github.com/isyuricunha">Github</a>", "<a rel="noopener" style="${style(
      props
    )}" rel="noopener" href="https://twitter.com/isyuricunha">Twitter/X</a>", "<a rel="noopener" style="${style(
      props
    )}" rel="noopener" href="https://discordapp.com/users/1018988240151253002">Discord</a>", "<a rel="noopener" style="${style(
      props
    )}" href="mailto:contact@yuricunha.com">Email</a>", "<a rel="noopener" style="${style(
      props
    )}" href="https://mastodon.social/@isyuricunha">Mastodon</a>"]`,
  },
];

export default info;
