export type categories =
  | 'windows'
  | 'web'
  | 'mac'
  | 'ios'
  | 'chrome'
  | 'android';

export interface ToolType {
  link: string;
  id: string;
  name: string;
  category: categories[];
  labels?: string[];
  description: string;
}

const Tools: ToolType[] = [
  {
    id: 'monzo',
    category: ['ios'],
    link: 'https://monzo.com/?utm_source=yuricunha.com',
    labels: ['Banking'],
    name: 'Monzo',
    description: 'A great mobile banking app.',
  },
  {
    id: 'dAppling',
    category: ['windows', 'mac', 'web'],
    link: 'https://www.dappling.network?utm_source=yuricunha.com',
    labels: ['Web Development'],
    name: 'dAppling Network',
    description: 'Decentralized Frontend Hosting.',
  },
  {
    id: 'telegram',
    category: ['windows', 'mac', 'ios', 'web'],
    link: 'https://telegram.org/?utm_source=yuricunha.com',
    labels: ['Messaging'],
    name: 'Telegram',
    description: 'Instant messaging app with lots of functionality.',
  },
  {
    id: 'vscode',
    category: ['windows', 'mac'],
    link: 'https://code.visualstudio.com/?utm_source=yuricunha.com',
    labels: ['Editor'],
    name: 'Visual Studio Code',
    description: 'A lightweight code editor with plenty of plugins.',
  },
  {
    id: 'discord',
    category: ['windows', 'mac', 'ios', 'web'],
    link: 'https://discord.com?utm_source=yuricunha.com',
    labels: ['Voice Chat'],
    name: 'Discord',
    description: 'A voice chat app.',
  },
  {
    id: 'webstorm',
    category: ['windows', 'mac'],
    link: 'https://www.jetbrains.com/webstorm/?utm_source=yuricunha.com',
    labels: ['Editor'],
    name: 'WebStorm',
    description: 'A JS IDE that works great.',
  },
  {
    id: 'fluent',
    category: ['chrome'],
    link: 'https://www.usefluent.co?utm_source=yuricunha.com',
    labels: ['Language'],
    name: 'Fluent',
    description: 'Learn a language in a unique way.',
  },
  {
    id: 'biorender',
    category: ['web'],
    link: 'https://biorender.com?utm_source=yuricunha.com',
    labels: ['Diagram Creation'],
    name: 'BioRender',
    description:
      'A web application for creating nice looking scientific figures.',
  },
  {
    id: 'appcleaner',
    category: ['mac'],
    link: 'https://freemacsoft.net/appcleaner/?utm_source=yuricunha.com',
    labels: ['Utility'],
    name: 'AppCleaner',
    description: 'Uninstalls all the files associated with an app.',
  },
  {
    id: 'bartender',
    category: ['mac'],
    link: 'https://www.macbartender.com/?utm_source=yuricunha.com',
    labels: ['Menu Management'],
    name: 'BarTender',
    description: 'Hides items in the menu bar.',
  },
  {
    id: 'kap',
    category: ['mac'],
    link: 'https://getkap.co/?utm_source=yuricunha.com',
    labels: ['Screen Recording'],
    name: 'Kap',
    description: 'A superior open source screen recorder.',
  },
  {
    id: 'rocket',
    category: ['mac'],
    link: 'https://matthewpalmer.net/rocket/?utm_source=yuricunha.com',
    labels: ['Emoji'],
    name: 'Rocket',
    description: 'Globally search emojis.',
  },
  {
    id: 'aldente',
    category: ['mac'],
    link: 'https://github.com/davidwernhart/AlDente?utm_source=yuricunha.com',
    labels: ['Battery Management'],
    name: 'AlDente',
    description: 'Prevents overcooking of your battery!',
  },
  {
    id: 'voicemeeter',
    category: ['windows'],
    link: 'https://vb-audio.com/Voicemeeter/banana.htm?utm_source=yuricunha.com',
    labels: ['Audio'],
    name: 'VoiceMeeter',
    description: 'An advanced virtual audio mixer.',
  },
  {
    id: 'obs',
    category: ['windows'],
    link: 'https://obsproject.com/?utm_source=yuricunha.com',
    labels: ['Screen Recording'],
    name: 'OBS',
    description: 'Open source software for screen recording.',
  },
  {
    id: 'spark',
    category: ['mac', 'ios'],
    link: 'https://sparkmailapp.com/?utm_source=yuricunha.com',
    labels: ['E-Mail'],
    name: 'Spark',
    description: 'The best email client.',
  },
  {
    id: 'pock',
    category: ['mac'],
    link: 'https://pock.dev/?utm_source=yuricunha.com',
    labels: ['TouchBar'],
    name: 'Pock',
    description: 'TouchBar customisation.',
  },
  {
    id: 'zotero',
    category: ['windows', 'mac', 'chrome'],
    link: 'https://www.zotero.org/?utm_source=yuricunha.com',
    labels: ['Citation Manager'],
    name: 'Zotero',
    description: 'An open source citation manager that focuses on simplicity.',
  },

  {
    id: 'raycast',
    category: ['mac'],
    link: 'https://raycast.com/?utm_source=yuricunha.com',
    labels: ['Spotlight Replacement'],
    name: 'Raycast',
    description: 'Spotlight, but its good.',
  },
  {
    id: 'cleanshotx',
    category: ['mac'],
    link: 'https://cleanshot.com/?utm_source=yuricunha.com',
    labels: ['Screenshots'],
    name: 'CleanShotX',
    description: 'A better screenshot tool.',
  },
  {
    id: 'iina',
    category: ['mac'],
    link: 'https://iina.io/?utm_source=yuricunha.com',
    labels: ['Playback'],
    name: 'IINA',
    description: 'An intuitive media player.',
  },
  {
    id: 'flow',
    category: ['mac', 'ios'],
    link: 'https://flowapp.info/?utm_source=yuricunha.com',
    labels: ['Pomodoro Timer'],
    name: 'Flow',
    description: 'A simple app to make use of your time.',
  },
  {
    id: 'dashlane',
    category: ['windows', 'ios', 'chrome', 'android'],
    link: 'https://www.dashlane.com/?utm_source=yuricunha.com',
    labels: ['Password Manager'],
    name: 'Dashlane',
    description: 'A simple extension to organise your passwords.',
  },
];
export default Tools;
