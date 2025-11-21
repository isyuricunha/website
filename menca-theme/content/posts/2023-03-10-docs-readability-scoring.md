---
title: Docs Readability Scoring
author: Dachary Carey
layout: post
description: In which I automate readability scoring for documentation.
date: 2023-03-10 17:00:00 -0500
url: /2023/03/10/docs-readability-scoring/
image: /images/docs-readability-hero.jpg
tags: [Documentation, Coding, Writing]
---

Experienced documentation writers know that grammar isn't the only important aspect of documentation. Readability is a huge part of what makes documentation good. Readable documentation:

* Is scannable, with lots of clear sections and bullet points.
* Has short, simple sentences. 
* Uses common vocabulary and avoids jargon.

## Why Readability is Important

The [Nielsen Norman Group advises writers target an 8th grade reading level](https://www.nngroup.com/articles/legibility-readability-comprehension/). Most technical writing comes in at 12th grade or higher. Documentarians sometimes use the excuse that it's "technical writing" so higher is ok. This doesn't consider that the density of documentation is an accessibility issue.

Who needs simple documentation?

* People who are in a hurry.
* People who speak English as a second language.
* Teams who intend to translate documentation into other languages.

Even if you aren't targeting an international audience, simple documentation benefits everyone. But it might surprise you to know that the average American has a [7th to 8th grade reading level](https://literacyproj.org). [Some sources](https://en.wikipedia.org/wiki/Literacy_in_the_United_States) estimate it's even lower than that. So if you write to an 8th grade level, you're writing for the average American.

## Scoring Docs for Readability

Improving docs readability has been a pet project of mine for a while. But I've had mixed success getting my teammates to care about readability. So for hackathon, I decided to automate readability scoring for our documentation.

There was one complication: we write our documentation in reStructuredText. The readability scoring libraries that are currently available score markdown or plain text. So I needed to be able to parse our rST to plain text.

### Parsing rST to Plain Text

Enter [docdoctor](https://github.com/cbush/docdoctor). Docdoctor is a tool that my lead, Chris Bush, wrote. It's a TypeScript/ Node command line tool to manipulate rST files in our docs repositories. It uses another library, [restructured](https://github.com/seikichi/restructured), to parse the reStructuredText. It adds some tools on top to deal with some things that are specific to our docs toolchain.

I added [a command](https://github.com/cbush/docdoctor/blob/main/src/commands/readability.ts) to this command-line tool to manipulate the rST to output plain text. Along the way, I make some tweaks to improve the accuracy of readability scoring. There's a fair amount of markup that skews the readability scores. We really only want to be scoring the content for readability. So I throw out a lot of markup, and add punctuation in places, to focus scoring on the content.

### Scoring Text for Readability

After converting the rST to plain text, with a few minor tweaks, we can score it for readability. We're using a Python library, [textstat](https://pypi.org/project/textstat/), to do the scoring. This library lets you select from 16 readability heuristics. I've chosen two: [Flesch-Kincaid Grade Level](https://en.wikipedia.org/wiki/Flesch–Kincaid_readability_tests#Flesch–Kincaid_grade_level) and [Flesch Reading Ease](https://en.wikipedia.org/wiki/Flesch–Kincaid_readability_tests#Flesch_reading_ease). 

The automation that I've set up applies these heuristics to every file in a documentation PR. This gives us readability scores for everything we touch while we work.

### Automating Readability Scoring

With these tools, I can automate scoring our documentation PRs for readability. I've set up two GitHub workflows that automate this process. 

The [first workflow](https://github.com/mongodb/docs-realm/blob/master/.github/workflows/readability.yml):

* Checks out files that we've touched in the documentation PR.
* Uses docdoctor to convert the rST to plain text.
* Uses textstat to score that plain text for readability.

It stores the output of our textstat scoring script as a workflow artifact.

The [second workflow](https://github.com/mongodb/docs-realm/blob/master/.github/workflows/readability-comment.yml):

* Gets the workflow artifact that has the readability scores.
* Posts it as a comment on the pull request.

The second workflow is separate for security reasons. If the first workflow actually posted the comment, it could expose the GitHub token to bad actors. (Don't ask me how I know this.)

The end result is this: for every docs PR, we get a comment posted on the PR with readability scores for each file we touch.

![Screenshot of a GitHub PR comment listing files changed in the PR and readability scores for those files](/images/docs-readability-hero.jpg)

It provides recommended readability score targets. And a link to [Hemingway App](https://hemingwayapp.com) so writers can get tips to improve readability.

## Increasing Awarenesses Increases Caring

Providing docs writers feedback about readability on every PR makes readability visible. If you see that chart saying "Oh, it's fairly hard to read this page" you may think about improving that. My hope is that this will lead to more work improving readability docs-wide. At the very least, it will remind me to go refactor my docs pages for readability.
