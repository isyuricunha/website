---
title: Docs Consolidation Project - One Month Check-In
author: Dachary Carey
layout: post
description: In which I explore lessons learned in the first month of a project to consolidate 9 docs sets.
date: 2024-06-26 15:00:00 -0500
url: /2024/06/26/docs-consolidation-project-one-month-check-in/
image: /images/docs-consolidation-one-month-check-in-hero.png
tags: [Documentation, Writing]
---

My team documents a product that represents 9 different SDKs in 9 different programming languages. (And these things are not a 1:1 correlation!)

To date, we have maintained 9 individual sets of SDK documentation - one for each SDK. Our decision to consolidate these documentation sets probably warrants a separate blog post, so I'm making a mental note to do that soon. But for now, just know that we have decided to consoldiate these individual doc sets into one single set of documentation. It has a programming language selector on the page to let developers denote which version of the code example and relevant SDK details they want to view.

## The Work

The Jira epic I've made for this project contains 65 tickets. About 50 of the tickets are for consolidated pages and content changes, and the rest are for required correlated work. (Mainly updating links in other places, but a few other required one-off infra-related tasks.) The 50 consolidated pages represent the majority of our docs corpus, but there is some variation in the existing SDK docs structure. It's not 50 pages in EVERY SDK - in some SDKs, it may be closer to 40. In other SDKs, it may be closer to 65-70. So it's not a direct "take the same page in every SDK and combine it into one page project." It's more like "look at pages in each SDK that contain the content that will go on the consolidated version of the page, and move it." For one of the PRs I've put up so far, the content for 1 consolidated page was spread across **10** SDK pages for a single SDK. That one consolidated page (which turned into three during the PR because it got so long) incorporated content from 45 docs pages across the existing 9 SDK corpus.

## The Estimate

My original estimate for this project was that it would take about 6 weeks to consolidate these 9 docs sets into a single docs set. I estimated that I would be able to do roughly one Jira ticket per day, with an estimate of me doing ~30 of these tickets. I estimated that two of my teammates would be able to help me complete this work at the rate of 3 or 4 PRs per week, combined. (So one to two PRs per person, per week.) I estimated that they would complete the remaining ~20 of the main content Jira tickets over that 6 week period.

## One Month of Progress

At the one-month mark, we are sitting at 12% of the Jira tickets closed, and 6% of the Jira tickets in review. So we are roughly 18% through the project.

If my original estimate had held, we should have been at or over 60% through the content tickets.

## Revised Estimate

After one month of work, I've learned a lot about how we need to work on this project and what sort of timelines might be more realistic. I am hoping two more months, or another 8 weeks, will see the main content pages complete. So that would make the content consolidation project a 12 week project instead of a 6 week project. I'd like to do these blog post check-ins monthly until the project is complete, so it will be interesting to see where next month sees us.

## Lessons Learned

After the first month of working on this project, here's a roundup of things I have learned about doing this work:

### Other Priorities Slow Things Down

When I put together the estimate, I was thinking I would be working full-time on this project, and a couple of my teammates would be able to help me. We would still need to cover high-profile or high-priority feature releases, but summer tends to be slower as a lot of our European engineers take extended time off. So I thought I had a realistic expectation of how much time we'd be able to spend on this project.

In reality, other things crop up in our daily work life, and I didn't anticipate how much those would slow us down. Things like:

- Unexpected meetings
- Required training
- The mid-year Performance and Growth cycle
- Conferences

All of these things take a bite out of the time we've had to do this work. Additionally, it has become clear that my teammates need to spend more time on some other things, so they're not as available as I would have expected. 

I really *wanted* this to be our priority when we planned the project, so that we could get through it "quickly" - but the reality of work is that other priorities come up, and I should have built in more cushion for that in my initial estimate.

### More Gaps than Anticipated

I knew the documentation structure varied somewhat between SDKs, and that some of the SDKs had better coverage than others. But even knowing that, I underestimated how many gaps really exist.

As part of planning this project, I made plans for follow-up epics to close the gaps in code examples for our most used or highest priority programming languages. I have an epic for each SDK where we plan to fill in code examples. And this is spawning - a *lot* of follow-up tickets. So far, we've been missing one or more code examples for each language on the page for every consolidated page we've done. And in some cases, we're missing some languages entirely. So the follow-up work will be - not insubstantial.

I have planned and executed a few smaller gap analysis projects in the past, but it has been hard to get an accurate accounting of the gaps due to differences in docs structure between SDKs and ongoing work that has changed the docs while the analysis is underway. This will be by far the most thorough and accurate gap analysis we've done.

### More Differences in Implementation than Anticipated

One of the reasons we have maintained the SDK docs as different documentation sets from the beginning is that there are some differences in how the functionality is implemented in each SDK. I knew that going into the project. I had some plans to account for that, but as we have dug into the content and the differences, we've had to do more decision-making than expected about how to deal with content that varies radically because the implementation varies radically. We have now established a few patterns for how to handle these differences in implementation. I'm hopeful that means we will be able to make decisions about how to handle these differences more quickly and speed up the work overall.

Unfortunately, the gaps in coverage combined with the differences in implementation mean it has taken me dramatically longer than expected to do some of these pages. I have been spending a lot of time digging into the API reference docs and actually trying to understand and communicate how each API is implemented in each SDK. It's kind of wild how different some of the implementations are. A few of the SDKs have more than one API for creating objects, for example, while others rely on a single API that leverages programming language features for some of the lifting. Some of the SDKs never implemented various APIs - probably for good reasons, but I wasn't there when those decisions were made so I don't know why. Even for APIs that I know very well, I'm still spending an hour digging into all the different implementations of a single method to find out how it works in each SDK. And for APIs that I don't know well, it takes longer.

### We Have to Do Less Rewriting

It's very tempting, as we go through literally every single page of the docs, to add new content or rewrite existing content to better serve our audience. We *are* changing product naming based on some product changes last fall, which requires us to tweak some wording and product positioning on literally every page. But we *cannot* afford to do substantial rewrites as part of this project. We need to get the consolidation piece done ASAP, and consider coming back and rewriting high-impact content *after* the project is complete. Even knowing that, I have spent time adding a paragraph here or a small new section there. I have made a follow-up epic for net new content, and will try to defer as much rewriting and net new content creation to that project. One of my colleagues struggles with this issue, too. We need to be more focused than we have been and do less rewriting.

### We Need to Do More Focused Reviews

Reviewing is the other side of this rewriting piece. As reviewers, we have been looking at the consolidated content with fresh eyes and pointing out things that don't flow well, or concepts that aren't fully explained, or headings that don't really describe the content well. It is very tempting to leave a lot of comments requesting changes. But similar to how we need to do less rewriting - we have to do more focused reviews.

Before we started the project, I established a PR review checklist that asks the reviewer to check these four things:

- Shared code example boxes contain language-specific snippets or placeholders for every language
- API reference details contain working API reference links or generic content
- Product naming/positioning has been updated
- All relevant content from individual SDK pages is present on the consolidated page

Notice what's missing here? Anything relating to re-reviewing the content. And most of our review comments so far have been focused on requested content changes. We *have* to be more focused in our reviews and adhere to this checklist. Otherwise, this project will stretch far longer than we've budgeted or can afford to spend.

The review process has been going pretty slowly as we all figure out what things to pay attention to, and what things we have to accept as-is. We've had a level set around this, and I think it should speed up going forward. But it has bogged things down in the first month of the project.

### The Work is HARD

I knew the resulting documentation set would be more complex to maintain, although it would contain less duplicate content. But I did not reckon with quite how *hard* the actual work would be. There is a LOT of cognitive overhead involved in every page. We have to look at all of the docs pages that relate to the content that should be on the new page. We have to make sure that *all* of the content across all 9 versions of each page is represented on the consolidated page - as well as any related pages that don't match the structure of the new docs set. We have to dig into the implementation details for literally every single method, so we can link out to the API reference docs where that info is missing and try to explain the conceptual elements even if we aren't creating new code examples right now.

Each page involves making dozens or hundreds of decisions, and digging deep into the SDK implementations. That is a *lot* of congitive work. I was anticipating something more like "round up the content for each page and maybe add a few missing details for languages that have less coverage." I don't think I could possibly have been prepared for how much actual thinking and researching is going into even this pared-down version of the project.

For reference, this is the PR author checklist that I created specifically for this project:

#### PR Author Checklist

- Open the PR against the feature-consolidated-sdk-docs branch instead of master
  - Tag the consolidated page for:
    - genre
    - meta.keywords
    - meta.description

##### Naming

- Update product naming and the language around persistence layer/local/device per this document (link)
- Include .rst files comply with the naming guidelines

##### Links and Refs

- Create new consolidated SDK ref targets starting with "_sdks-" for relevant sections
- Remove or update any SDK-specific refs to use the new consolidated SDK ref targets
- Update any Kotlin API links to use the new Kotlin SDK roles

##### Content

- Shared code boxes have snippets or placeholders for all 9 languages
- API description sections have API details or a generic placeholder for all 9 languages
- Check related pages for relevant content to include
- Create a ticket for missing examples in each relevant SDK: Consolidation Gaps epic

## This Project is SO NEEDED

So now that we're a month in and running behind our estimate, what do I think about the project? Honestly, digging into this has really driven home how much we really need to do this project. Yes, it's hard work. Yes, it's going to take longer than expected. But the resulting consolidated docs will be so much more complete, and will be so much easier for us to maintain going forward, that I am realizing now how much we can't afford *not* to do this work.

I guess I'll see how I feel in another month!
