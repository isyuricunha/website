---
title: Docs Consolidation Project - Month Two Check-In
author: Dachary Carey
layout: post
description: In which I explore lessons learned in the second month of a project to consolidate 9 docs sets.
date: 2024-07-28 15:00:00 -0500
url: /2024/07/28/docs-consolidation-project-two-month-check-in/
image: /images/docs-consolidation-two-month-check-in-hero.png
tags: [Documentation, Writing]
---

My team documents a product that represents 9 different SDKs in 9 different programming languages. (And these things are not a 1:1 correlation!) To date, we have maintained 9 individual sets of SDK documentation - one for each SDK. I successfully made the case that we should consoldiate these individual doc sets into one single set of documentation, but now we have to do the work! This is the second in a series of posts that will continue until the project is complete. For the month one post, check out [Docs Consolidation Project - One Month Check-In](https://dacharycarey.com/2024/06/26/docs-consolidation-project-one-month-check-in/).


## The Original Estimate

I originally estimated that this project would take 6 weeks. I had planned for myself and two teammates to be working on it. I estimated that I would be able to complete 30 of the ~50 content tickets myself in that 6 week period, and my teammates would complete the remaining 20 content tickets between them.

## Two Months In

At the two-month mark, we are sitting at 20% of the Jira tickets closed, and another 5% of the Jira tickets in review. So we are roughly 25% of the way through the project.

If my original estimate had held, we should have been completely done with the content tickets, and working through any remaining infrastructure-related tickets.

In the first month, we closed 12% of the Jira tickets. In the second month, we closed an additional 8% of the Jira tickets. So we seem to have slowed our pace during the second month.

## Revised Estimate

Last month, I said that I hoped to have the main content pages complete in another 8 weeks. We are halfway through that time period, and we have not made the progress required for that to be a realistic assessment.

There are currently 68 story points worth of Jira tickets unclaimed in the content portion of the project. If I have estimated correctly for those pages, we're looking at 68 person days of work there. Given that I am the only person working on this project at the moment, I've got roughly 20 person work days per month, which would take me over 3 months to complete the remaining unclaimed tickets. I think an additional 4 months is not an unreasonable assessment.

That would make this project a total of six months, but my original estimate was 6 weeks.

My revised estimate at last month's check in was that the project would take a total of 3 months, so this is double last month's assessment.

## Lessons Learned

### Other Work Interrupts Long-Running Projects

Part of the reason the project pace has slowed is that other work has been interrupting work on this project.

My lead and I had originally agreed that I and two teammates would work on this project to try to get it done ASAP. Two months in, one of those teammates has completed one ticket, and the other teammate has a ticket in draft that is not yet complete. This project has been constrained to *my* bandwidth, and I've also spent some time working on unplanned talks and other long-term strategic initiatives in the last month.

I had a planned week of vacation this last month during the first week of July, and with other work and meetings, I would estimate I had between 8 and 10 days to work on this project in the last month. That's pretty consistent with closing an additional 8% of the Jira tickets. So my estimating seems to be accurate to the actual time spent on the project. But I did not reckon with how many other things would come up that would prevent us from actually working on the project.

My two teammates are now working on other projects + their own vacation time for the next month, so I don't anticipate any new tickets from them during the next month.

### Net New Docs Take Time

Before the consolidation project started, I made a plan to defer net new code examples to follow-up work. I made placeholders for missing code examples that say the docs don't currently have an example of this, which we will fill in later as a follow-up project. But we are also lacking API descriptions for a lot of the SDKs for these gaps. I am writing those missing API descriptions as part of the work in *this* project, which has slowed things *way* down.

For example, a 5-point ticket that I'm currently working on is the consolidated CRUD/Delete page. This page deals with all the methods and special information for deleting database objects or clearing property values. The consolidated page has these sections:

- Delete Operations
- Delete Objects
  - Delete a Single Object
  - Delete Multiple Objects
  - Delete All Objects of a Type
  - Delete All Objects in the Database
- Delete Related Objects
  - Delete an Object and its Related Objects
  - Delete an Embedded Object
- Delete Property Values
  - Delete an Inverse Relationship
  - Delete Mixed Property Values
- Remove Elements from Collections
  - Remove Elements from a List
  - Remove Elements from a Set
  - Remove Dictionary Keys/Values

Of these sections, seven of the nine existing SDK docs sets only contain this information:

- Delete a Single Object
- Delete Multiple Objects
- Delete All Objects of a Type

A few of them contain one or two other sections. Only two of the nine existing SDK docs sets contain *most* of these sections.

Each section represents some conceptual information if required, that can be shared across all the SDKs. And an SDK-specific API description that says something like:

> To delete a single object, call the `delete()` method inside a write transaction. Pass the object you want to delete as an argument.

When possible, those methods link out to the relevant API reference docs for the method. Not all of the API reference docs have linkable methods for all sections. But also, the method names vary, the implementation details vary, and not all of the SDKs even have this description written currently! Some of them just say something like:

> The following example shows deleting a FOO object:

With no information about the method calls, the fact that it has to be done in a write transaction, or any other details.

Given that 7 of the 9 SDKs are missing 10 of the sections on this page entirely, I have to hunt down the details and write ~70 of these API descriptions for the missing sections. Add to that having to write API descriptions for some of the *existing* sections given that the docs don't have that currently, that means I'm writing - 80? net new API descriptions for this page.

This is a *lot* of work that I didn't really understand I was signing us up for when I scoped this project. I knew there were gaps, but I didn't realize the implications of that information.

You might ask if these API descriptions *have* to be written as part of this project, or if we shouldn't just go back and fill them in later. I have contemplated that myself. But if we omitted the descriptions from this work, some of the sections would be no text at all for a given language, and a code example block that says we're missing an example of this for this language. It feels like an MVP requirement for this project to at least provide a text description of the method call to do the thing, plus a link out to the API reference docs for details, if possible.

### We Need to Re-Align on Some Things

There are a couple of things that we seem to be *not* aligned on, in terms of how we talk about a few things and how we link out to other documentation sets. This has resulted in inconsistent review comments, which require me to rework things depending on the reviewer. And it also results in an inconsistent finished project. So we need to make some time to sit down as a team and discuss these things to make sure we're aligned.

### Action Taken from Last Month

Two things I identified last month that were slowing us down were:

- We have to do less rewriting
- We have to do more focused reviews

I shared those lessons with my team, and I do think we have successfully applied that feedback and have improved in those areas.

I've started making tickets for rewriting or writing net new content as follow-up work, but I've still had to do *some* rewriting to accommodate the fact that SDK implementations are so variable, or the gaps are so wide. I'm just trying my best to keep it small in scope and ask myself if I should be spending time on it when I do it.

We have been a lot more focused in our reviews, flagging things that got copied incorrectly or API reference links that don't work, but not nitpicking on existing language. This is tough, because it's very tempting to make a bunch of wording improvements as we are literally touching everything. But it's necessary to be able to get through this work at all. I'm glad we've been able to align on this and have taken action to keep it from slowing us down.

## This Project is SO NEEDED (Still!)

Now that we're two months in and even further behind in our estimate, what do I think about the project? Yes, I *still* think it's really needed. It has driven home how incomplete and inconsistent our docs coverage is, and this will be a huge leap forward. We may need to revisit the scope of the project if it continues to go this slowly, but I'm optimistic there will be fewer interruptions in the next few months and we may be able to pick up the pace.

Looking forward to next month's check-in!
