---
title: Knowing When Docs Need Updates
author: Dachary Carey
layout: post
description: In which I discuss the strategies for knowing when docs need updates.
date: 2023-10-18 12:00:00 -0400
url: /2023/10/18/knowing-when-docs-need-updates/
image: /images/docs-needed-hero.png
tags: [Documentation, Coding, Writing]
---

As documentarians, our role doesn't stop at creating new documentation. We're also responsible for keeping existing documentation updated. If you’re part of a downstream team that is not involved in planning, finding out when the documentation needs updates can be challenging.

This is one part a process problem, and one part a people problem. You can solve process problems. People problems are harder.

## Establish a Process to Communicate about Changes

The first step to finding out when documentation needs updates is establishing a process to communicate changes. It doesn't have to be a heavy process. It can be something as simple as getting included on scope or technical design documents. It could be getting yourself invited to kickoff or planning meetings. Or it could be a `Docs Needed` flag on a Jira ticket. 

A process to communicate about changes shouldn't require a person to manually notify you of a change. People go on vacation. People get busy and forget things. Relying on a specific person to notify you of changes guarantees a miss at some point.

## Know Which Changes Require Updates

The second step to knowing when to update docs: understand which changes require updates. Not every change requires docs updates. Some changes are entirely invisible to the user. Some changes may be visible to the user, but may be things like bugfixes that make the thing actually function the way you've documented it. In these cases, you probably don't need to update documentation when changes drop.

Determining when changes require updates is a very human problem. In some teams, writers rely on product or engineering stakeholders to make this call. For other teams, it’s on the technical writer to understand when a change necessitates docs updates. A combination of these strategies can help you ensure changes don’t get missed.

On my current team, we use a combination of these strategies. When there's a new feature, product stakeholders may highlight certain aspects of the feature that they want to showcase or document. Engineering stakeholders may also have ideas about docs, often focused on implementation details. But we writers also test and use the product ourselves to determine what changes to communicate.

Stakeholder-driven documentation updates can fall down when changes are small, or when product or engineering isn't super familiar with the documentation set. In these cases, it may not occur to product or engineering that something needs a documentation change. If we rely on a stakeholder to *tell* us that docs need an update, we may miss the change in these cases. 

It behooves us as documentarians to be aware of even small product changes. We must have enough familiarity with the product and documentation set to make the call about updating docs.

## Docs Changes Unrelated to Product

When your documentation contains *any* reference to third-parties, you need a separate process to check for changes. These references might be as small as links to third-party websites, or may include instructions to use third-party tools.

You may document how to use Apple, Google, or Facebook authentication in your product, for example. You must have a process to check for changes to how those things work, and update your documentation when required.

At a minimum, you can set up a link checker to tell you when external links return a 404. But ideally, you should maintain an inventory of third-party references and their types. Conduct regular audits of these assets to ensure your documentation is up-to-date. 

With things like code examples, you can automate testing for some of that. For example, if you use a third-party SDK with your product, you could set up CI to run tests for that regularly. But with things like procedures where you list steps to set something up in a third-party tool, you must test those manually on a routine schedule.

## Be Aware of Engineering Changes

The processes we've discussed so far can help you catch most of the required updates to your documentation. But if you work in an organization where you have access to the code, you can watch that code for changes that require documentation updates.

This one is more of a stretch goal for people with scripting or development skills. I was so keen to solve it that I wrote a macOS app that watches GitHub repositories for new pull requests. The app lets you decide whether to watch or ignore a pull request based on whether you care about its contents. It's called [PR Focus](https://prfocus.app), and it's currently in a private beta with a few of my friends and co-workers.

With this tool, I can see when new engineering work starts when the engineers open a pull request in a repository I care about. When they open a new pull request, it shows up in my Inbox, along with some metadata about the PR.

I can choose whether to watch or ignore every pull request that comes in. This lets me ignore things like automatic security updates, but pay attention to the pull requests that might warrant documentation changes.

![PR Focus screenshot showing the Watch and Ignore options in a right-click context menu from the PR Summary](/images/watch-or-ignore-pr-context-menu.png)

If I need to get more information about a pull request to decide whether I want to watch or ignore it, I can easily view those details. I can view pull request details in the app, or I can open the pull request in GitHub.

![PR Focus screenshot showing the PR Details view](/images/pr-detail-view.png)

PR Focus allows me to see whenever engineering starts or completes work on a feature. My app's UI changes when there are updates to the PRs I'm watching to let me know there are new details. When engineering merges a PR, I know they've completed the work and I can start my documentation work.

Since I work in a docs-as-code workflow, I also added the ability to keep an eye on my own pull requests, or watch PRs I'm reviewing or where I'm an assignee. This helps me make sure I'm keeping up-to-date with any pull request that requires my attention. I can easily find out when I’ve gotten a review on one of my pull requests, or see when one of my teammates updates a PR I’m reviewing and I need to re-review it.

Because my organization works in GitHub, I've written this tool specifically for GitHub. GitLab and Bitbucket have their own developer APIs, and you could write something similar to watch repositories hosted by those providers. 
