# yuricunha.com

my personal website and blog, built with hugo and focused on privacy, performance, and simplicity.

## about this project

this is my personal website where i share my thoughts, projects, and experiences. i built it using [hugo](https://gohugo.io), a fast and flexible static site generator.

### why this stack?

i chose this technology stack for a few key reasons:

- **lightweight** - static sites are incredibly fast and require minimal server resources
- **privacy-first** - no tracking scripts, no external dependencies, no ads bloating the experience
- **simple** - markdown files and simple templates, no complex frameworks or databases
- **secure** - static sites have minimal attack surface compared to dynamic platforms

## acknowledgments

this website uses the excellent [hugo blog awesome](https://github.com/hugo-sid/hugo-blog-awesome) theme created by [sidharth](https://github.com/hugo-sid). huge thanks to them for creating such a clean, fast, and privacy-conscious theme.

the theme is:
- minimal and clean
- supports dark mode
- 100/100 google pagespeed score
- no jquery, no bootstrap, no external dependencies
- privacy-conscious with no trackers or ads

you can check out the original theme at: https://github.com/hugo-sid/hugo-blog-awesome

## what i changed

while the base theme is excellent, i made some customizations:

- customized color scheme to match my personal brand
- added a snippets section for quick code examples
- added hardware page to showcase my setup
- customized social links and profile information
- set dark mode as default theme

## tech stack

- **generator**: [hugo](https://gohugo.io) (extended version)
- **theme**: [hugo blog awesome](https://github.com/hugo-sid/hugo-blog-awesome)
- **styling**: scss (compiled by hugo)
- **scripts**: vanilla javascript (minimal, no frameworks)
- **hosting**: static hosting (fast and secure)

## development

to run this site locally:

```bash
# clone the repository
git clone https://github.com/isyuricunha/website.git
cd website

# initialize submodules (for the theme)
git submodule update --init --recursive

# run the development server
hugo server -D
```

the site will be available at `http://localhost:1313`

## building for production

```bash
hugo --minify
```

the built site will be in the `public` directory.

## license

- the content of this website is © yuri cunha
- the hugo blog awesome theme is licensed under the mit license
- see the [theme's license](https://github.com/hugo-sid/hugo-blog-awesome/blob/main/LICENSE) for details

## contact

- website: [yuricunha.com](https://yuricunha.com)
- github: [@isyuricunha](https://github.com/isyuricunha)
- x/twitter: [@isyuricunha](https://x.com/isyuricunha)

---

built with ❤️ and hugo
