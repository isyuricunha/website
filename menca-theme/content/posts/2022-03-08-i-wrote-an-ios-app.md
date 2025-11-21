---
title: I wrote an iOS app!
author: Dachary Carey
layout: post
description: In which I write an iOS app to track RPG playthrough details.
date: 2022-03-09 15:01:35 +0300
url: /2022/03/08/i-wrote-an-ios-app/
image: /images/wrote-ios-app-hero.jpg
tags: [Coding]

---
I've had a handful of iOS app ideas in the past few years that I could never quite figure out how to turn into reality. I found it frustrating, though, because I really want to _use_ the apps I've had ideas for. Finally, I've had enough practice with smaller projects that I managed to turn an idea into reality: my first iOS app is live on the App Store!

May I present: [Shattered Ring][1], the Elden Ring task tracker you didn't know you needed.

Yes. I wrote an iOS app to help me keep track of NPCs, locations, and quests in a video game I'm playing. (In my defense, though, I'm used to playing open world RPGs that have quest-tracking systems... and I'm a more casual gamer... and this makes it easy to keep track of threads and dive in and out without having to play 20 hours a week just to remember what I was doing.)

It's the first app idea I've managed to complete. I know it's just a teeny little hobby app, but I couldn't be prouder. Now that I've gone through the whole process from start to finish with this app, I'm hopeful I'll have the experience I need to turn some of my other hobby apps from ideas into reality.

If you're into Elden Ring, check it out and let me know what you think! Or if you play D&D, or any other TTRPG, it also makes a great RPG game tracker. I'm using it in the two D&D games I'm in.

I wrote this in SwiftUI, using some of the [Realm DB][2] Swift SDK goodies that they've written just for SwiftUI. I've complicated my life a little with a data model that means it isn't just a simple build, but I can still use some of the [SwiftUI property wrappers][3] and it's pretty magical. And of course, I had to spin up a website for it - which I did in Hugo because it's fast and easy (and not WordPress - really need to migrate this blog). 

Hope some folks find it a useful little app! I know I already do.

 [1]: https://shatteredring.com
 [2]: https://realm.io
 [3]: https://docs.mongodb.com/realm/sdk/swift/examples/swiftui-guide/