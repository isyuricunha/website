---
title: Benefits of Docs Writing Code Examples
author: Dachary Carey
layout: post
description: In which I discuss the benefits of having a documentation team writing the code examples.
date: 2023-10-26 12:00:00 -0400
url: /2023/10/26/benefits-of-docs-writing-code-examples/
image: /images/docs-writing-code-examples-hero.png
tags: [Documentation, Coding, Writing]
---

A few weeks ago, I wrote about [the benefits of testing the code examples in your documentation](https://dacharycarey.com/2023/10/10/test-docs-code-examples/).

That article has sparked some interesting conversations. The topic kept turning to who should be writing the code examples.

I’m more convinced than ever that engineers should not write the code examples in your documentation. There are a lot of benefits to the way my team does it: the documentation team writes their own code examples.

## Engineers are too close to their code

Have you ever heard the adage that writers can't - or shouldn't - edit their own work? This is true because we're too close to our work. We *cannot* read it as outsiders. We know exactly what we meant, and we interpret our own writing in the way we intended it. We have a hard time spotting the awkwardly-worded phrases, typos, and grammar issues.

In a very similar way, engineers may be too close to their own work to communicate about it to outsiders. They know every detail of the code they implemented. When talking about it to others, they may leave out details that are “obvious” to the team that implemented it. Or because it doesn’t occur to the engineer that the details are notable. 

When a documentarian writes a code example, they are writing that example as an *outsider* - as a consumer of the code. They’re more likely to go into detail or break things down because they are *not* familiar with the code. And that makes the documentation more accessible for developers who need to use it.

## Teaching code is different from engineering code

Writing example code to teach someone how to do something is different than writing application or library code. You need to break things down to the right level of abstraction. You need very simple, clear examples that only show one thing. Examples may need to build progressively. Ideally, the examples should illustrate the use case. 

Good engineering code may use a high level of abstraction that makes it performant and extendable. It may use generics, templates, macros, or other language features. This may be great for the product itself, but it's not so great when your aim is to show someone a simple use case.

## Technical writers maintain a holistic picture of the docs

Engineers write example code in the context of “I have implemented this feature. Here is an example that shows it.” A technical writer writes a code example with a holistic picture of how it fits into the documentation. Documentarians may use a consistent set of example objects across many examples. They may adhere to a specific theme. They know what's around it in the documentation. This bigger-picture context means documentarians can ensure a more consistent user experience.

## Documentarians are more focused on the prose alongside the code

Successful documentation combines code and prose to give developers the information they need. Technical writers write the content that goes alongside the code. But when they write both the code and the content, they can make sure everything works together. Ideally, when technical writers update code examples, they’re more likely to also update the accompanying content.

## Technical writers provide a secondary form of QA

When documentarians write code examples, they provide a secondary form of QA. This code may use the APIs in different ways - in the ways that a consumer of the API would use them. This can help catch bugs and edge cases.

## Technical writers think more critically when they have to write the code

If you hand a technical writer an API, they have to think critically about how to use it. That critical thinking and testing process leads to more thorough documentation. If you hand a technical writer a code example, they’ll document the code example you provide. But they may miss important considerations about using the API. They may not feel empowered to challenge what’s in the code example. Or may not think critically about implications for developers who use the code.

## Co-locating code examples with documentation simplifies process

Engineers typically write example code in the repository where the product code lives. It may get tested with CI, which is great. But that repository may not be co-located with the documentation. 

When example code is someplace else, this complicates getting it into the documentation. It also means documentarians may miss updates to the code examples. It may mean documentarians have to ask the engineers to update code examples, or make PRs to the engineering repository. This creates a tight coupling between the engineering repository and the documentation. This can introduce delays or undesirable dependencies.

One colleague told me how brittle it made the process when examples lived elsewhere. They had maintenance issues over time. In the end, they scrapped the code examples.

## Code examples can't change without the documentation team knowing

When documentarians write code examples, the code examples don’t change without the docs team. When engineering writes code examples, those examples may drift over time. Those examples may no longer match the prose around the example in the documentation. Or they may not get updated in the documentation set. 

When a documentarian has to update a code example, they’re more likely to update the content around it. A documentarian with a holistic picture of the docs can change related pages elsewhere.

## Documentarians are cheaper than engineers

The unit economics of having engineers write code examples doesn't make sense. Most organizations pay engineers a much higher salary than technical writers. It makes good sense to let those high-paid engineers focus on writing the product code. Let the much more affordable documentarians focus on writing the documentation code examples.

## Collaborating builds empathy and improves awareness

When documentarians write code examples, they ideally get a technical review from engineering. This collaboration builds empathy between technical writers and engineers. Tech writers gain appreciation for the work and good API design that the engineers do. Engineers gain visibility into the documentation, and can provide feedback on important details. But they don’t have to do the work themselves. This benefits both sides. In a perfect world, it builds stronger ties between these two teams that should be natural allies.
