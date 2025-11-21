---
title: Welcome to my new, new home.
author: Dachary Carey
layout: post
description: In which I migrate from WordPress to Hugo.
date: 2022-11-19 10:01:35 -0500
url: /2022/11/19/welcome-to-my-new-new-home/
image: /images/new-new-home-hero.jpg
tags: [Personal]
---

Why are we here? (Well, why is any of us here, really?)

No, not an existential question - a practical one! You're here because you clicked a link from... somewhere. And want to know more about this Dachary person, or at least read something that I wrote.

The current era is late 2022. Twitter is in the process of imploding. I fled there months ago, for sunny new shores on a Mastodon server. A new, massive influx of Twitter visitors heralds the end of a new age, and the beginning of a new?

As I've been getting more into programming and the technical side of things, I've become - unhappy - with using WordPress as a platform for my home on the web. I don't like using a platform that someone else controls. I don't like all the changes to the UI over the years. I don't like the vulnerability to hacking attacks, and the attractiveness of WordPress as a target to hackers.

Hubby and I had our travel blog on WordPress from 2010 through - earlier this year, maybe? And starting around 2016-2017, it seemed like it got hacked every month or two. It was ridiculous. My personal WordPress site never got hacked, but I'm convinced it was a matter of timing. 

And now, with this influx to Mastodon, there is a special trick to getting a "Verified" checkmark. My account doesn't get the checkmark - but links that I put on my profile can get verified if I put a special tag on the websites I link out to that shows I control them. Guess what! WordPress did _not_ like the tag I have to put on the site. I can theoretically get it to work if I spelunk in the bowels of the PHP hell that powers my theme - probably - but it is yet another reminder that I don't really control that site. It is some ridiculous honking framework that is a massive amount of overkill for one person's static home on the web.

So it's time to avail myself of some of the tools at my disposal. I'm switching my content over to a Hugo static site served from a GitHub repository. I'll have a webhook on the GitHub repo that has the server rebuild my site when I push changes to the repository. I can run Hugo locally to check how things look and tweak to my heart's content. Easy, peasy. 

It was a bit of a hassle to get my content out of WordPress and into Hugo. It has taken me over a week of work on nights and weekends, even after using [the WordPress to Hugo Exporter plugin][1] to get my content out of WordPress. It took a minute to figure out how to get the plugin installed and get it to work - alas, the repo's README author is not a technical writer. When I did get it to run, the content downloaded pretty quickly.

But then... I had a mess on my hands. Images came down with undescriptive names like 'featured.jpg' - or else a ridiculous hash. And for some reason, there were a million honking sizes of each image. This is what I got from one single blog post:

![Screenshot of macOS Finder showing a long list of hashed image names in different sizes](/images/wp-to-hugo-images.jpg)

And the actual image links came across as ridiculous HTML tags ala:

```html
<img decoding="async" loading="lazy" width="555" height="1200" src="https://dacharycarey.com/wp-content/uploads/2022/03/96540297-7A35-4EB3-A179-4C9223F66AEE_1_102_o-555x1200.jpeg" alt="" class="wp-image-480" srcset="https://dacharycarey.com/wp-content/uploads/2022/03/96540297-7A35-4EB3-A179-4C9223F66AEE_1_102_o-555x1200.jpeg 555w, https://dacharycarey.com/wp-content/uploads/2022/03/96540297-7A35-4EB3-A179-4C9223F66AEE_1_102_o-139x300.jpeg 139w, https://dacharycarey.com/wp-content/uploads/2022/03/96540297-7A35-4EB3-A179-4C9223F66AEE_1_102_o-768x1662.jpeg 768w, https://dacharycarey.com/wp-content/uploads/2022/03/96540297-7A35-4EB3-A179-4C9223F66AEE_1_102_o-710x1536.jpeg 710w, https://dacharycarey.com/wp-content/uploads/2022/03/96540297-7A35-4EB3-A179-4C9223F66AEE_1_102_o.jpeg 1170w" sizes="(max-width: 555px) 100vw, 555px" />
```

I just want simple Markdown. Ideally, with alt text. 

Oh, yeah, and did I mention that the theme I selected for my Hugo site wanted the hero images to be 1200 x 800? And essentially **NONE** of the images that exported from my WordPress site were in that size. So, it's time to re-make all of my hero images, or source new ones where the old ones were just ridiculously tiny.

Oh, also, the tags that came across weren't usable. And the timestamp format didn't work in the page metadata. And there were a million stupid HTML codes for "smart" things - smart quotes, smart ellipses, smart hyphens. 

So, even after using the plugin to export my content, I had to individually tweak every post. As I write this, I haven't done the image handling yet for the images that are in the posts - I may let hubby write me a script for that because he can do it quickly. And then, of course, I have to select the image sizes that I want to actually store, because I don't want or need to retain all of those different image sizes for a simple personal static site. 

_Note, a little bit later: I ended up handling the images myself. Hubby slept in this morning and I finished the images before he woke up - there weren't actually that many._

Ideally, this move to Hugo and hosting my content from a GitHub repo will make my site more portable in the future. Nothing lasts forever, and I'm sure someday I'll need to change things up again. But maybe next time it'll be easier because I won't have some uber framework eating my content and storing it with all kinds of weird custom markup and doing who-knows-what to the images that I upload.

Control your own destiny on the interwebs, folks. It'll make things easier the next time you need to move. Or, in the case of Twitter, flee a slow-motion train wreck that has suddenly sped up into realtime.

[1]: https://github.com/SchumacherFM/wordpress-to-hugo-exporter