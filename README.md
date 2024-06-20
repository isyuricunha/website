Hey there,

This is my current website project, meaning when you access it, you're diving into my portfolio ([you can click here to see it online](https://yuricunha.com/)).

Originally, it was ported/inspired by [Michael's site](https://github.com/mah51), but it's gone through several changes and alterations, incorporating various new and different technologies.

Here on my site/project, there are some new or improved things, as well as tools or technologies. And some of them include:

- Internationalization with i18n.
- Updated/revised GitHub API to fetch my public repositories.
- ConvertKit Newsletter API integration (also functional with Mailerlit).
- Comments section (currently deactivated).
- Enhanced Spotify API.
- Feed/RSS for my posts (thanks to all who subscribed!).
- Now section (what I'm up to) and About Me (the title says it all) sections, currently deactivated.
- Updated various packages.
- Design improvements like new icons, responsiveness, conventional routes, and APIs.
- Privacy-focused metrics/analytics (thanks, [Umami](https://github.com/umami-software/umami)).
- Proxy running on DuckDuckGo for more privacy and no tracking.
- Improved and/or added Robots, crawler URLs, and dynamic page titles for better indexing on search engines I don't like (Google, Bing, and others non-private) and those I do (DuckDuck, Qwarty, and similar).
- Updated Firebase API routes.
- Updated Spotify API routes.
- Page with the music I listen to on Spotify (artists, top tracks, along with a music history).
- Redesigned blog and blog layout, with dynamic routes for sharing ([WhatsApp](https://api.whatsapp.com/), [Twitter/X](https://x.com/), [Facebook](https://www.facebook.com/), and [LinkedIn](https://www.linkedin.com/)) and reading on other platforms ([Bear Blog](https://bearblog.dev/), [Substack](https://substack.com/), and [Reddit](https://www.reddit.com/)). Plus direct links to my podcasts (it's just my blog but with AI-generated voice).
- The blog has a link/icon for Google Translate, where it automatically opens translated into the language of your browser/device or the one you choose (I'm programming it to be translated directly on the blog, privately, to avoid using Google).
- Various other tools/technologies added or being added.

I have other versions that were just ideas thrown on the internet, and there's also a beta version, testing packages that might break functionality; they're public in my repositories here on [GitHub](https://github.com/isyuricunha?tab=repositories). But you'll have to find them yourself, right?

Currently, my site is translated into 9 (nine) different languages, but not all are complete. And this repository has a [GitHub action](https://github.com/isyuricunha/website/tree/main/.github/workflows) that automatically generates new [releases](https://github.com/isyuricunha/website/releases) every time I commit to it, but it doesn't matter if you download it directly from the release or via SSH Clone or Git Clone. However, if you download from the releases, make sure to use the zipped (.zip) or targzed (tar.gz) file labeled "source code."

The repository/site/project is active under my [personal license](https://github.com/isyuricunha/website/blob/main/license.md), and it's quite flexible, as long as you give proper credit and don't use it commercially, but I encourage you to read the license.

You can reach out to me via email at [me@yuricunha.com](mailto:me@yuricunha.com) or ping me on [Twitter/X](x.com/isyuricunha) if you need help, have questions, or just want to chat.

To develop this project you need [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) (I use Yarn and will show how to build/develop on Yarn).

To install packages:

Run `yarn`.

To develop or see on your browser:

Run `yarn dev`.

You don't need build to put it on Vercel or Netlify (I only know this hosts).
Remember to set-up env and environment variable, or it won't work.

I believe I've said all I had to say. Cheers!

PS: Project versions work like this: V1.2.3: The 1 represents Design, the 2 represents a significant technology change, and the 3 represents a minor change or alteration (maybe just a bug fix).
