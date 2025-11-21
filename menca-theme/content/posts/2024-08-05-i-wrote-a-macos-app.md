---
title: I wrote a macOS app!
author: Dachary Carey
layout: post
description: In which I write a macOS app to track important pull requests.
date: 2024-08-05 00:01:35 -0000
url: /2024/08/05/i-wrote-a-macos-app/
image: /images/prfocus-hero-1.png
tags: [Coding]

---

Apparently writing [Shattered Ring][1] a few years ago whetted my appetite for useful tools that do what I want in the way I want. A mere month after releasing Shattered Ring, I started working on [PR Focus][2]: a macOS app that tracks pull requests across GitHub repositories. After more than two years of nights-and-weekends development, and *several* incarnations along the way, I have now released PR Focus on the Mac App Store!

Consider the use case: you're someone who depends on work that is tracked through GitHub pull requests. Maybe you're a developer who needs to track your own PRs, or the PRs you're reviewing. Maybe you're like me - a technical writer who needs to document the code that the engineering team writes. Jira issues are an imperfect representation of the state of the work. The code itself is the source of truth when the product is code, and that code is tracked in GitHub pull requests.

I use PR Focus to watch engineering repositories where the actual work is happening - where the code is getting committed, reviewed, and merged. I see every pull request that comes through the repositories I watch, and decide whether to watch or ignore any given pull request. I can safely ignore PRs that only have internal impact, like changes to CI, fixing tests, or updating internal dependencies. But I *see* every PR that has public-facing impact - that is, every PR where my team needs to write new documentation or update existing documentation - and I can easily keep track of the state of that code. Is it in progress? Is it in review? Has it been approved?

If it seems like the review comments are mostly resolved, and the CI tests are passing, it's probably a good time to start documenting the code changes. But if a PR is still in draft, what's there now may not resemble what actually gets released.

As a bonus, my team is a team of docs-as-code technical writers. We *also* work in GitHub, and we write documentation in multiple repositories. So I can *also* use PR Focus to keep track of my own PRs. Do I need to remind someone to review it again? If I got a review, do I need to make any changes? Is one of my PRs failing its status checks, or has some other change caused a merge conflict so my PR is no longer mergeable? Is a PR I'm reviewing for my team ready for another look? How is the PR coming along for a feature I've been tracking?

I recently added the ability to track one-off pull requests instead of watching everything that comes through a repository, and *that* has been super useful for me to track some of the Swift concurrency pull requests in the [Swift GitHub repo][3].

If you're someone who would benefit from watching pull requests on GitHub, check it out and let me know what you think!

I wrote this app in SwiftUI, using [Atlas Device SDK][4] (formerly Realm Database). It has been - interesting - to dig into all the differences in SwiftUI APIs between iOS and macOS. A lot of the helpful web content for SwiftUI development *assumes* you're working on iOS apps. Lots of macOS devs I see talking about SwiftUI say it's still not mature enough to develop macOS apps - too many APIs are missing. But you know what? I don't know any better, and I've built my app almost entirely in SwiftUI. I did have to drop down to the underlying macOS APIs in a few places, but that's trivial to do.

I've also used two incarnations of the GitHub API. My initial version of this app used the [GitHub REST API][5]. I needed to make *far* too many API requests to get the info I wanted to track here, due to GitHub's... quirky... API design. It was too easy to run up against GitHub's 5,000 point per hour API rate limit. So I switched to [GitHub's GraphQL API][6] for more efficient querying. Working with both of these APIs has been a good learning experience for things like - what makes a good API, and what makes good API documentation. (Spoiler: this is a hard problem!)

Hope some folks find it a useful app! I know I do.

 [1]: https://shatteredring.com
 [2]: https://prfocus.app
 [3]: https://github.com/swiftlang/swift
 [4]: https://www.mongodb.com/docs/atlas/device-sdks/sdk/swift/
 [5]: https://docs.github.com/en/rest?apiVersion=2022-11-28
 [6]: https://docs.github.com/en/graphql
