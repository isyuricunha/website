---
title: Audit - Overview
author: Dachary Carey
layout: post
description: In which we try to make sense of our code examples, and track them.
date: 2025-03-02 00:11:00 -0000
url: /2025/03/02/code-example-audit-overview/
image: /images/audit-overview-hero.png
tags: [Documentation]

---

My company uses a docs-as-code workflow. We have historically split our documentation by product, for reasons related to our platform's implementation of table of contents and documentation/product versioning. This means we have documentation in a *lot* of different repositories (60+ by my last count), and the people who write and manage that documentation are split across four separate documentation teams. Each team has a different process for writing code examples. So for any given repository/product, the code examples may be created using a different process, and may contain widely variable content.

As part of setting goals for the organization, management wanted to understand the distribution of code examples across our documentation, so we could identify gaps and expand our coverage where needed. Our Education AI team made a first pass at this last fall, parsing the *entire* body of our documentation for code examples, and counting the number of examples by programming language.

The number of results we got, and their distribution across programming languages, surprised people in the organization. This kicked off a conversation about what a code example is, exactly, and how we might get a better understanding of the code examples across our documentation. As my team has taken on the mantle of becoming our organizations code example wranglers, we took over this task.

This was the first attempt to do anything like this in the organization - understand the code examples holistically and comprehensively across the entire documentation corpus, instead of ad-hoc on a project, product, or sub-product basis. It was a nebulous and massive task, which broke down to some logical units. I've broken these out into an eight-part series to make it easy for folks to pick-and-choose which elements most interest them.

At the time of writing this overview, the audit is complete, but it's going to take me some time to write all this up, so I'll add links to the "Coming soon" content as I make time to write up the details.

- [What is a code example?](http://dacharycarey.com/2025/03/02/audit-what-is-code-example/)
- [What should we track?](http://dacharycarey.com/2025/03/10/audit-what-to-track/)
- [How can we access the data?](http://dacharycarey.com/2025/03/16/audit-access-data/)
- [AI-assisted classification](http://dacharycarey.com/2025/03/23/audit-ai-assisted-classification/)
- [Modeling code example metadata](http://dacharycarey.com/2025/04/27/audit-model-code-example-metadata/)
- [Slicing code example metadata](http://dacharycarey.com/2025/08/23/audit-slice-code-example-data/)
- [Audit conclusions](http://dacharycarey.com/2025/09/07/audit-conclusions/)
- Audit recommendations (coming soon)
- Ongoing code example reporting (Coming soon)
