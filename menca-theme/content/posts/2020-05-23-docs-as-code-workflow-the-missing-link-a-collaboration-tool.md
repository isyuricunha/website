---
title: 'Docs-as-code workflow: the missing link; a collaboration tool'
author: Dachary Carey
layout: post
description: In which I wax poetic about the value of previewing a docs-as-code site.
date: 2020-05-23 15:01:35 +0300
url: /2020/05/23/docs-as-code-workflow-the-missing-link-a-collaboration-tool/
image: /images/tugboat-hero.jpg
tags: [Documentation, Writing]

---
[Docs as code][1] is a technical documentation movement to use the same tools that developers use in the documentation workflow. It's a great way to enable collaboration with developers, and now that I've been doing it for more than a year, I can't imagine writing documentation for developers, with developers in any other toolchain. But one thing is missing from most docs-as-code workflows: a collaboration tool to easily share the work and solicit feedback.

## Why do you need a collaboration tool in a docs-as-code workflow?

One might question why you need a collaboration tool beyond the git provider when you're writing technical documentation for and with developers. Just commit, push it to your preferred git provider (I mostly use GitHub), make a pull request, and request review.

Sure, fine, that's all well and good for a simple text change. But what if you're adding new pages, or entire new sections, to the documentation? What if you're adding images, callout elements, and other styling? What if you're changing visual elements on a page? Reading text in GitHub is easy enough, but anything more complex than that, such as clicking through the navigation of a new page or new sections, seeing images in line with text, or really looking at any visual change adds that much more resistance to reviewing a PR.

If it's not something that parses easily in text, or if it's a change to linking or navigation that wants human verification, whomever you're collaborating with must maintain a local version of the documentation site, pull down the branch or check out the PR locally, and then build the site locally in order to view the changes. If the reviewer doesn't already have a local version installed, how much longer do you think it'll take them to review your documentation PR? _Ugh, now I've got to install this web framework, clone down the repo, and then get the whole thing set up just to check out these three new pages... I'll do it later._

Then you have the issue of whether your reviewer is a non-technical stakeholder. What if you need the product manager to review and sign off on your documentation before it can go live? What if someone in marketing, or someone on the leadership team, wants to see details about how the hot new feature works before you push publish? That person isn't installing a local and cloning down a git repository just to look at a few pages. That person may not even have access to the git repository.

What you need is a collaboration tool that doesn't require the reviewer to have a local install of the documentation site at all.

## Enter Tugboat, the missing link

So how do you solve this problem? There are a number of ways you might approach it, but I think the best case scenario is to add a continuous integration tool that can build your site before you push the changes live. Unfortunately, for many technical writers, setting up that tech stack is a bit beyond us. 

Setting up a CI solution requires adding services, having access to servers where the site can be deployed, etc. The organization may not have the appetite for that kind of infrastructure investment just for documentation. Even if it does, you'll need a developer to set it up and maintain it. But even if you can get a developer's time to set it up, that's the kind of project people wander away from, and when it inevitably breaks at some future point, good luck getting a developer's time again to debug it.

This is where [Tugboat][2] comes in. It's a git pull request builder that automatically generates a working version of the website for every pull request/merge request. (This is also a developer tool that developers use when building websites, so it's a good match for the docs-as-code workflow. And who among us doesn't love introducing developers to a good tool they're going to love?)

## How Tugboat works

Using Tugboat involves a few steps: set up a project in Tugboat, link it to the git repository where your documentation site lives, and commit a `config.yml` file that lives in a `.tugboat` folder at the root of your directory.

![Screenshot of a GitHub repository with an arrow pointing to a .tugboat folder at the root of the directory](/images/add-tugboat-config-to-root-1200x549.png)

The config gives Tugboat the instructions it needs to build your site. The documentation site (that I write!) offers [starter configs][3] for some common static site builders, as well as things like building a WordPress or Drupal website, with more configs and tutorials added as they're requested.

![Screenshot of the Tugboat documentation site showing available starter configs in the table of contents](/images/tugboat-starter-configs-1200x648.png)

While the sample config files are helpful, you probably don't _need_ one that's specific to your static site builder. I made the Hugo and MkDocs files myself by working from the old config for our deprecated GitBook legacy documentation site. If you do get stuck, I'm happy to help, or Tugboat has a [Support Slack][4] that anyone can join to ask questions.

With Tugboat configured, there are a couple of ways to view the website previews; either directly in the Tugboat UI:

![Screenshot of the Tugboat website showing a Preview button](/images/preview-in-tugboat-ui-1200x476.png)

Or you can configure Tugboat to post the website preview right to your pull request in your git provider, either as a deploy environment or as a link in the comments on your PR:

![Screenshot of Tugboat deployment links on a GitHub pull request](/images/view-deployments-in-github-1200x822.png)

At this point, anyone with access to the git PR can click on the Tugboat link and view a live preview of the site. You could also copy the URL and send it to any non-technical stakeholder who wants to review the site - be it a product manager or a member of the leadership team. Anyone you send the link to can view the site, with no need to have a git or Tugboat account. For a docs-as-code project, developers who are reviewing your PRs can do it in Tugboat, without checking out the PRs and building them locally. 

This is the Tugboat preview for this site (just an example site for testing):

![Screenshot of a MKDocs site preview rendered by Tugboat](/images/tugboat-preview-for-mkdocs-site-1200x731.png)

That's a fully working version of the site, with clickable links and everything, just as if I had built it locally. It's hosted at a temporary URL at Tugboat, and when I merge the PR, the Tugboat preview gets deleted automatically - no need for me to do any cleanup. If I make changes to the PR, the Tugboat preview can be rebuilt to include those changes.

## Conduct simultaneous reviews easily

With this collaboration tool in my pocket, I can have anyone I want review changes to the documentation site before it goes live. I don't have to worry about maintaining a staging or QA server for the documentation site, or getting stuck with review bottlenecks while I wait for a developer to deploy changes so someone can look at my work.

Even cooler is the ability to conduct simultaneous reviews easily. Say, for example, my company has a new user admin feature coming, so I update the docs and make a PR. A Tugboat preview gets generated, and I can share it with the product manager and/or developers responsible for that feature for review.

Separately, there's a new tool being added to my company's app. As long as I'm using a proper branching workflow and branching from master, I can create those docs independent of the user admin feature above. Make a PR for that documentation, and a different Tugboat preview gets generated. I can send those docs to a different product manager and development team for review. That review can be happening simultaneous to the one above, and whichever review is completed first can get merged into the documentation. 

I don't have to worry about the user admin review being done, so I can then get the documentation for the new tool loaded to the staging server for sharing with relevant stakeholders, etc. And if the documentation for the new tool gets approved first, I can merge that PR and the Tugboat preview goes away, while the link to the user admin documentation change persists.

I've been super happy with having this tool in my technical documentation workflow, and I wish I'd had it at prior jobs. Now that I do, I can't imagine working in a docs-as-code workflow without it.

 [1]: https://www.writethedocs.org/guide/docs-as-code/
 [2]: https://www.tugboat.qa/
 [3]: https://docs.tugboat.qa/starter-configs/
 [4]: https://www.tugboat.qa/support/