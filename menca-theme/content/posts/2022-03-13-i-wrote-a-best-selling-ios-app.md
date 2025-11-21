---
title: I wrote a… best-selling iOS app?
author: Dachary Carey
layout: post
description: I which I am amazed to wake up and see my app leading sales in its category.
date: 2022-03-14 15:01:35 +0300
url: /2022/03/13/i-wrote-a-best-selling-ios-app/
image: /images/best-selling-app-hero.jpg
tags: [Coding]

---
Hey! Remember that time I wrote an iOS app to keep track of my Elden Ring and D&D play through details, and released it to the App Store?

Why, I remember it like it was just last week...

Turns out, when you email industry-specific news sources with topical news that has an interesting angle, some of them will write about your stuff. 

My little hobby app, Shattered Ring, has been featured on a ton of video game news sites, including:

  * Video Games Chronicle: [A new iOS app lets players track quests and NPCs in Elden Ring][1]
  * Metro: [Elden Rings fan creates a task-tracker phone app so you never forget a side quest][2]
  * Games Radar: [This Elden Ring app helps you track NPCs and side quests][3]
  * Eurogamer: [This Elden Ring fan created an iOS app to help players track quests][4]
  * MP1ST: [Elden Ring Side Quests Tracker "Shattered Ring" Developed by Fan Released][5]

After the App Store approved my app last week, I spent an hour or two reaching out to 5 video-game-related news sources every night. As far as I can tell, Video Games Chronicle was the first one to write about it on Friday, and then it started showing up everywhere. There are a ton of other websites that credit the original VGC article, but a few also seem to have gone to the [Shattered Ring][6] website and actually read up on what the app is and does.

It was Kay who noticed on Friday evening that my app was #7 in its category (Entertainment) on the App Store. And throughout the evening, we watched it slowly climb. The dog woke us up around 6am on Saturday asking to go outside, and I made the mistake of checking the app on my phone. And that's when I saw it:

![Shattered Ring app at position number 1 in the App Store](/images/539ACA62-91F0-4D2F-A038-B37FEF4BBC43-555x1200.jpeg)

Whoa. #1 in its category on the App Store. I. Wrote an app. That climbed to #1 in its category.

Needless to say, I wasn't getting back to sleep after that. I got up with the dogs and let hubby sleep in.

The problem is, I had never written an app before. I had no idea how many apps sell on the App Store. What did #1 in its category actually mean? And what did people think of my app?

I waited impatiently for Apple to publish its sales data. Eventually, I saw that #1 translated to 184 units sold. Wow! Nearly 200 people had bought my app!

Of course, Apple takes its cut. And I should hold back a share for taxes - I spent enough years as a self-employed writer to know the government has to have its cut. And then there were expenses I incurred in writing the app; things like domains for the website, web hosting, Formspree for the contact form, and some apps I used while writing the app. After expenses, I would net about $80 from my meteoric rise on the App Store. Which Apple would pay me up to 45 days after the last day of the month in which the sale occurred, so something like two months from now. So, not a life-changing experience. But definitely something to be proud of.

And then the reviews and emails started trickling in. Where was all the data? Why wasn't there a ready-made list of NPCs, game locations, and quests just waiting for people to check off their progress?

Uh oh. Apparently what I thought of as an "RPG task tracker" and what other people thought did not totally line up - at least in some cases. I was thinking of it as a notebook replacement; something that would make it easy to connect NPCs to Locations and Quests, and store notes about each, and even give me a roundup of stats for things like how many quests I had completed and which locations I had cleared versus the ones where I had run away screaming and probably should go back when I was higher level. But some people, it seemed, wanted more than that for their $3.

I apologized to the folks who had expected more, and bookmarked the link to request a refund from Apple - and even added it to a FAQ on the Shattered Ring website. And I responded (nicely, I think) to the folks who posted 1- and 2-star reviews of it on the App Store. I revisited the wording on my site and in the App Store description and tweaked the wording, even though I thought it was clear what the app is and does.

I knew that I wanted to make some navigation improvements to the app, and there were also some features I had wanted to add but didn't want to wait to ship in v1 - but now I had an app in production with nearly 200 users actually using it. This was the part I hadn't thought too much about. Now people who had paid me money were relying on my app. I had a responsibility to them. So I didn't just dive into new features and navigation improvements; I started writing every automated test I could think of to try to make sure that my changes wouldn't break anything, or if they did, my tests would catch them.

Automated UI tests were slow going. I've only done a little bit with UI tests, and I'm still not familiar with how to refer to all of the UI elements for testing purposes, so there was a lot of trial and error. And my app is stateful (and so are my UI tests, at the moment, although I know in principle I need to refactor them to _not_ be) so I have to wait for the entire suite to run every time I iterate, which started out at about ~15 seconds but was up to a minute by the time I went to bed.

Unfortunately, I saw another review before I went to bed that made me worry: a user was reporting a crash. Not a crash! Quirks, I could live with, but crashes are not ok. So I had a semi-stressful night thinking about how to resolve that crash, and how many more tests I had to write before I could go making big changes to the app. 

I woke up this morning and started in on tests. But when I saw Apple's data from Saturday's sales confirming that more people had bought the app on Saturday - it hovered around #1 or #2 all day - I had a sinking feeling. I couldn't leave all those people with a buggy app. I had to fix it, even if my automated tests weren't done yet. 

So I shifted gears. I spent some time adding a small tweak that a lot of people were requesting - the ability to edit NPC, Location, and Quest names (apparently iPhone autocorrect is aggressive!) - and finding and fixing the bug. It was a particularly snarly thing for me - I was presenting a sheet during a particular UI flow, and the sheet wasn't dismissing after creating an object. So if users pressed the "Create" button again trying to get the thing to work, it would crash on them. Although they could swipe down to dismiss, and the object would be created.

I couldn't figure out _why_ it wasn't dismissing (I still don't know) but I thought back to a review that my lead had given me on the SwiftUI app I wrote for work, and his comments about not passing too many @State variables back and forth between views for navigation. So I refactored the navigation to use a different view pattern, instead of presenting a sheet. (I do present a sheet in other parts of the app and use a couple of different ways of dismissing it - using an Environment variable with the dismiss() API, and using @Binding vars to change state. It bugs me that I couldn't figure out why this one wouldn't dismiss.)

Anyway. Unfortunately, after refactoring the navigation and adding the name edit functionality, my update touched 28 files in my app. I did my best to manually test all of the flows - repeatedly - since my automated tests still aren't fully implemented. And then had to figure out how to ship an update to the App Store. (Apple, I love your products, but I do not love your documentation.) And the next thing I knew, it was 7pm on a Sunday and I have lost my entire weekend to app maintenance stuff.

I **hope** the update I shipped fixes the bugs. I will probably be low-grade stressed about it until I see reviews or get user feedback that I haven't introduced some horrible new bug. But the whole thing drove home something I hadn't really thought too much about while I was writing this app - now that I have taken money from people, I have a responsibility to them to make sure the thing I sold them actually works. _And_, being a people pleaser, I will probably sink way too much of my free time into shipping new features based on requests. I want people to be happy with the thing I made. I want them to like it.

So, yeah. I wrote a best-selling app in its category on the App Store, at least for a little while. And at some point today, it made it all the way up to the #5 top-selling app on the App Store across all categories. That is pretty cool for a little hobby app that I wrote!<figure class="wp-block-image size-large">

![Shattered Ring app at position number 5 in the App Store](/images/96540297-7A35-4EB3-A179-4C9223F66AEE_1_102_o-555x1200.jpeg)

But, to quote a great line:

<blockquote>
  With great power comes great responsibility.
</blockquote>

There may be hundreds of people using my app now - but now I owe them something in return. And that is stability, and maybe also an app that gets even better at doing the thing they want to do with it. 

I guess now I'm a real developer?

P.S. I _am_ sorry to have disappointed all the folks who want an Android version. I had one angry person on Twitter say: "Why on earth anyone would make an iOS exclusive app is beyond me. Literally 70% of the mobile market is Android. Is this some American thing where the Apple delusion is just accepted?" Nope! Just that I don't own an Android device, and I don't know Java or Kotlin, and I'm one person who wrote this app quickly in their free time outside of their full-time job and family/social responsibilities... sorry, Android user, that an Android dev hasn't done the same by now. Although now that my app is out in the world, and has been splashed across a boatload of video game news sites, maybe some Android or multi-platform dev is out there writing something better!

 [1]: https://www.videogameschronicle.com/news/a-new-ios-app-lets-players-track-quests-and-npcs-in-elden-ring/
 [2]: https://metro.co.uk/2022/03/11/elden-ring-fan-creates-phone-app-so-you-never-forget-a-side-quest-16259604/
 [3]: https://www.gamesradar.com/this-elden-ring-app-helps-you-track-npcs-and-side-quests/
 [4]: https://www.eurogamer.net/articles/2022-03-12-this-elden-ring-fan-created-an-ios-app-to-help-players-track-quests
 [5]: https://mp1st.com/news/elden-ring-side-quests-tracker-shattered-ring-developed-by-fan
 [6]: https://shatteredring.com