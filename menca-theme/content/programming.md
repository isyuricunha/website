---
title: Programming
permalink: /programming/
image: '/images/programming.png'
---

I'm a self-taught programmer who works mainly in Swift, but recently I've been working in C++, Kotlin, and Dart. Sometimes I dip my toes into Python, TypeScript or Go as the project requires.

For fun, and to learn more about programming and practice my skills, I've got several apps in various states of development. This is the current list:

Shattered Ring
--------------

[Shattered Ring](https://shatteredring.com) is a SwiftUI app that uses Realm Database. It's an iOS app I wrote to track Elden Ring play through details - namely, important NPCs, Locations and Quests in the game. It's my first app that I've [released to the App Store](https://apps.apple.com/app/shattered-ring/id1613271666), and I know it's a tiny hobby app but I'm so chuffed to have it out in the world.

Bonus: it's also great for tracking D&D or other TTRPG games! I'm using it to keep track of two D&D campaigns I'm in.

I wrote most of the [Realm SwiftUI documentation](https://www.mongodb.com/docs/realm/sdk/swift/swiftui/) while working on this app. I had to figure out how to do things with Realm and SwiftUI, which I translated to public-facing documentation.

PR Focus
--------

[PR Focus](https://prfocus.app) is a GitHub tracking app for macOS. My regular workflow has me keeping track of pull requests across many repositories. I need to stay on top of my own GitHub pull requests, pull requests where I'm a reviewer, and pull requests by the upstream engineering teams whose work I document. Turns out, other folks on my team find it helpful, too. I've been running a private alpha for a year, and have just opened a [public beta on TestFlight](https://testflight.apple.com/join/PmdjrF6U) for a limited number of spots.

I'm writing my tool as a macOS app with SwiftUI and Realm. It has been interesting to write a macOS app with SwiftUI, and stumble across the differences between writing for it and iOS. It's also more complicated, as I'm working with the GitHub API. I started the app using the GitHub REST API, but switched to the GraphQL API for more efficient network requests. Working with both APIs has given me a great opportunity to directly compare REST vs. GraphQL, and a lot of insight into what makes "good" API documentation as I consume it.

Of course, as a technical writer, I've written [a documentation site for PR Focus](https://prfocus.app/docs/). I've made this documentation site the in-app help using a web view.

Coffeelicious/Tealicious
------------------------

Coffeelicious for me, and Tealicious for the spousey, are trackers where we can keep tabs on our preferred beverages. Whenever I go to order coffee beans from various roasters, I can't remember what I've liked and haven't liked from the prior orders, and I'm also not learning more general details about flavor profiles I like, coffee characteristics I like, etc. I want an app where I can rate the coffee I drink, and have that app build a profile for me to get recommendations about coffee I'd like. I've been through a few iterations of this and have never quite gotten it to done, but after my progress with Shattered Ring, I'm hopeful these apps will follow shortly.

Template Apps for MongoDB Realm with Sync
----------------------------------------------

My team at MongoDB maintains a series of simple "template apps" in each of the Realm SDK languages to make it easier for developers to get started using MongoDB Realm with Sync. These are simple templates that are pre-populated with some of the basic code to work with Realm and Sync, that are automagically connected to a Sync backend that persists data in MongoDB Atlas. You sign up, select the "Create a Template App" option, a backend is created for you, and you have a few options to download the template app code. It's a pretty spiffy system that my very smart teammates have put together.

I've made two big contributions to it:

- The SwiftUI Template App, which you can see in the [Swift client dir of the Realm Template Apps GitHub repository](https://github.com/mongodb-university/realm-template-apps/tree/main/sync-todo/v2/client/swiftui).
- The C++ Template App - a command line todo tracker that uses [FTXUI](https://github.com/ArthurSonzogni/FTXUI) for the GUI - which you can see in the [C++ client dir of the Realm Template Apps GitHub repository](https://github.com/mongodb-university/realm-template-apps/tree/main/sync-todo/v2/client/cpp)
