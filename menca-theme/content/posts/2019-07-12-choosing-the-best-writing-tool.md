---
title: Choosing the best writing tool
author: Dachary Carey
layout: post
description: In which I lay out a generalist approach to choosing writing tools.
date: 2019-07-12 15:01:35 +0300
url: /2019/07/12/choosing-the-best-writing-tool/
image: /images/best-tool-for-the-job-hero.jpg
tags: [Business, Writing]

---
In my recent technical writing job search and interviewing process, I've encountered a lot of discussion around tooling. I always ask about the toolchain for a position I'm considering, and I'm happy to talk tools all day long. But the truth is, I'm tool agnostic. My questions about toolchain aren't about deciding if you use a tool I like; they're about discovering the maturity of your process.

That's because there is no such thing as a one-size-fits-all writing tool. 

I had an interviewer ask me recently: "When you sit down at the computer to write, what app do you open?" He seemed a little surprised when I responded: "That depends entirely on what I'm writing." Here's why:

Different writing tools are designed for different tasks. There are also a lot of ancillary tools related to writing tasks that a writer might need to use in the course of the job.

## Word processors

When the general public thinks about writing on a computer, they typically picture a word processor, such as [Microsoft Office][1] or [Apple's Pages][2]. I'm also seeing more and more enterprises using [Google Docs][3] for basic word-processing tasks, as part of [G Suite][4] adoption within the orgs.

Currently, I don't use word processors very often. I'd typically fire this type of app up when working on a simple article or marketing piece. The majority of the time these days, I'm only using a word processor when editing something a client has sent me. It's fine for simple revision work, or working with simple content, but if you're hiring a technical writer and you want complex deliverables in Microsoft Word, I might run the other direction.

(Not because I don't know how to use the more advanced functionality of these tools, like Table of Contents, etc. - but because this isn't the best tool for long-form or sophisticated content needs, and if it's the tool you rely on, that tells me a lot about your organization's documentation processes. But that's a whole 'nother blog post...)

## Long-form writing

One of my favorite writing apps ever is [Scrivener][5]. I've spent a fair amount of my time over the years drafting long-form content; think novels and business books. 

I think it is the single best writing tool for long-form content out there; it has amazing support for organizing and re-ordering content, revision workflow, storing relevant research and notes within the app, and more advanced features to help you tackle even the most complex long-form writing project.

And the compiling options... so many compiling options.

If you're a single person working on long-form writing projects, Scrivener is the way to go.

Unfortunately, it's really not great for collaboration. And if you're doing a project that requires complex page layouts, that's not where Scrivener shines. I suspect most business users have never even heard of it; it's really more of a lone novelist's tool. But I heart it so much.

## Text editors

When the technical writing gets more technical, I turn to simple text editors. Recently, I worked on some API documentation using GitHub-flavored Markdown, which I committed to a private repo on GitHub, so I used [Atom][6] for this project. It's simple, displays Markdown and code nicely and makes it easy to spot potential problems. Atom does a good job of 'helping' with auto-complete and spotting properly-formed (and improperly-formed) syntax. 

When I'm working on simple code, JSON, XML, Markdown, CSS or HTML, I use Atom. It's my preferred tool when doing the more technical type of technical writing. (Until I get to more substantial code manipulation, and then I use an IDE, but that's more developer-y and is probably an outlier for a pure writer or tech writer.)

I have friends who prefer [VS Code][7], and my husband is a staunch [Vim][8] user... there are a lot of opinions about text editors, especially among developers. I'll leave you all to your holy wars.

I also have a few other text editing apps I use on occasion; [iA Writer][9] and [MacDown][10]. Because you can never have too many text editors; one for every occasion!

## CMS

Sometimes, I write directly in a content management system, or CMS. When I'm blogging here, for example, I just write the content directly in WordPress. When I was working for a client who had a help authoring-flavored CMS, I authored that content directly in the CMS. Same for clients I've had using Drupal. 

I prefer authoring directly in a CMS if I'm creating rich content, with links and images, that will ultimately end up in a CMS; saves overhead vs. drafting it in a word processor, and then fighting with formatting when bringing it into the CMS from another app. (Unless I'm working in Markdown, and the CMS supports Markdown. Then I might just draft the content in my text editor.)

You'll note I don't have a separate section for wikis. I don't make a distinction between a wiki and other types of CMSs; from a technical writer's standpoint, a wiki is just another type of CMS. Granted, a wiki is supposed to encourage collaboration, so you may have more contributors, and effectively managing content there may require more process. But that's another digression...

## HATs

Some clients need a sophisticated authoring solution like a help-authoring tool, or HAT. HATs are great if you need to single-source content, create conditional content, or want to output in specific/multiple formats. [MadCap Flare][11], [Adobe RoboHelp][12], [Author-It][13], and [Oxygen XML Author][14] are all HATs.

HATs are great for a single technical writer, or a team of technical writers, working to produce help documentation. Things get more complicated if you want a tool that enables easy collaboration outside of the technical writing team, such as collaboration with SMEs. More sophisticated (and expensive) authoring tools support collaboration well, too, but may add cost in terms of adding seats for SMEs, or complexity, in terms of requiring SMEs to work with docs in a specific way.

One company I've talked with during my interviewing process uses Flare for their authoring, which is a tool I quite like, but they manage open source projects, and they're struggling with finding the right process to get open source documentation into Flare. The workflow they're using is to have the technical writers manually pull in content from PRs into Flare in order to update open source docs, but this type of workaround a trade-off and something to consider when selecting tooling. 

## API documentation

The API documentation project I recently completed was quite simple, so I just used [Atom][6] to manually draft the docs. I've added a REST Client package to my Atom install, which is very basic, but gets the job done. I did install and poke [Insomnia][15], which is a more robust REST client with a focus on documentation, but I didn't need those capabilities for the small project I just wrapped.

On the other end of the API documentation spectrum, you have something like [Swagger][16], which is an API development tool that also has some documentation elements, such as being able to automatically generate components of API docs, or ensuring API docs stay up-to-date as the API changes. I see it in a lot of job postings, and it's a valuable tool for developing and documenting complex APIs.

## Charts and presentations

By far the most common charting and diagramming tool I see in job descriptions is [Microsoft Visio][17], which makes me a little sad. Microsoft products get the job done, but... well, I'll refrain from further comment until I'm in a longer-term gig where I know I won't have to use them. But my preferred charting tool is [OmniGraffle][18], and it's the one I will continue to use for my personal projects for the foreseeable future.

And then you have presentations, which, sadly, have been the bane of offices everywhere from the very first [PowerPoint][19] presentation... and will continue to be so, because sometimes a presentation (or slide deck) really is the best tool for the job. As a long-time Mac user, I prefer Apple's [Keynote][20], but can use either. And let's not forget [Google Slides][21], which is the G Suite answer to presentations.

## Graphic editing, screen-capturing and video editing tools

Good documentation isn't just words. People are attracted to interesting and engaging pictures, and sometimes a picture can illustrate a point far more efficiently and effectively than words. And video can be a great way to demonstrate a complex flow, or can serve as an alternative to documents for people who are more visual learners.

As a documentarian, sometimes it becomes my job to create or edit those pictures and graphics, capture screenshares to illustrate flow, and even create and edit video. I own and routinely use a ton of tools related to this aspect of the job, and have used many more over the years, but here's a sampling:

  * [Adobe Photoshop][22]
  * [Pixelmator Pro][23]
  * [Skitch][24]
  * [SnagIt][25]
  * [Graphic][26]
  * [Camtasia][27]
  * [iMovie][28]

There are also some great stock image sites where you can get affordable images to use in documentation; I routinely use those in my personal project sites.

## Project management and issue trackers

Writing often entails some form of project management. There are a variety of reasons to use project management tools and issue trackers, from keeping track of incoming requests, to providing transparency to management about what's in-progress, to being able to show conversations about a specific deliverable.

Most recently, I've used [Basecamp][29], [Pivotal Tracker][30], [Jira][31], [GitHub Issues/Projects][32] and [Trello][33] for project management and issue tracking. I'm partial to Jira, but they each have their quirks, and I'm basically just a worker bee using whatever the organization uses. But I do strongly believe having one of these tools in place helps organizations of all sizes stay organized and on-top of outstanding tasks, and using this type of tool is something I look for when interviewing.

I also rely heavily on project management and issue tracking tools to provide transparency in an organization around workload and productivity. Working remotely requires an extra level of trust, and having a shared project management tool where other members of an organization can see the current workload broken down - and watch tickets progress through the columns - can help promote that trust. But there's a whole lot more I could unpack around this... I really need to write more about working remotely.

## Collaboration tools

Let's not forget collaboration tools, whether you're talking messaging tool ([Slack][34]) or shared workspace tools ([Confluence][35], [Notion][36]). Collaboration is key to getting anything done as a technical writer. Maybe you're collaborating with SMEs, or your department, or cross-departmentally among the org. Maybe you're collaborating with freelance or contract workers. 

There are a lot of contexts where collaboration tools are useful, and breaking things down to a particular level of granularity can be helpful; i.e. a shared workspace for each project, or a collaboration tool where you can lock-down access when you're working with external providers.

I've used Slack in every technical writing gig I've had since 2016, but I've rarely been a part of an org that uses workspace collaboration tools. More advanced collaboration tools _can_ speak to a maturity of process, but they can also indicate unnecessary overhead in a large organization. I always try to find out more about how these are being used when I encounter them in a workplace, because their mere presence isn't enough to accurately telegraph a company's process maturity.

## Source control, static site generators and command-line tools

On the more technical end of things, you have tech writers set up more like developers, with source control and local development environments for compiling static site generators and viewing the output of Markdown or other text files. I generally have the command line open for using git and serving static sites as I draft them, and the occasional foray into documenting a CLI or poking a piece of software.

Some technical writers never get into this level of technical complexity; I spent years at gigs where I never had to touch a command line and there was no source control; while other technical writers I know deal with this and more complex tooling and workflow on a daily basis. 

In my experience, the more tightly coupled a technical writer is with a software development team, the more likely they are to be working in this type of environment. Tech writers that are more embedded in Product, Customer Services or other parts of the org are more likely to be using software that abstracts away some of the technical complexity. But that's obviously not true in every case; there are a wide range of ways technical writers work within an org, so it's tough to make generalizations about tooling and workflow.

## The "best" writing tool changes in context

The one generalization it's safe to make about technical writing tooling is that the "best" tool varies based on the org, the desired output, SMEs and a broad range of factors. What's "best" in one org may not work at all in another org. As a writer, the tools I use today may not be the ones I'll use tomorrow; today I'm working on Markdown files in Atom and running git on the command line, but tomorrow I might be drafting a blog post in a CMS, or working on API documentation.

As a generalist, I enjoy using a wide range of writing tools; that way I can just pick up the best tool for the job when I sit down to start my task.

 [1]: https://products.office.com/en-us/home
 [2]: https://www.apple.com/pages/
 [3]: https://www.google.com/docs/about/
 [4]: https://gsuite.google.com/
 [5]: https://www.literatureandlatte.com/scrivener/overview
 [6]: https://atom.io/
 [7]: https://code.visualstudio.com/
 [8]: https://www.vim.org/
 [9]: https://ia.net/writer
 [10]: https://macdown.uranusjr.com/
 [11]: https://www.madcapsoftware.com/products/flare/
 [12]: https://www.adobe.com/products/robohelp.html
 [13]: https://www.author-it.com/
 [14]: https://www.oxygenxml.com/xml_author.html
 [15]: https://insomnia.rest/
 [16]: https://swagger.io/
 [17]: https://products.office.com/en-us/visio/flowchart-software
 [18]: https://www.omnigroup.com/omnigraffle/
 [19]: https://products.office.com/en-us/powerpoint
 [20]: https://www.apple.com/keynote/
 [21]: https://www.google.com/slides/about/
 [22]: https://www.adobe.com/products/photoshop.html
 [23]: https://www.pixelmator.com/pro/
 [24]: https://evernote.com/products/skitch
 [25]: https://www.techsmith.com/screen-capture.html
 [26]: https://www.graphic.com/
 [27]: https://www.techsmith.com/video-editor.html
 [28]: https://www.apple.com/imovie/
 [29]: https://basecamp.com/
 [30]: https://www.pivotaltracker.com/
 [31]: https://www.atlassian.com/software/jira
 [32]: https://help.github.com/en/articles/about-issues
 [33]: https://trello.com/
 [34]: https://slack.com/
 [35]: https://www.atlassian.com/software/confluence
 [36]: https://www.notion.so/