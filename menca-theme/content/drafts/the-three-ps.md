---
title: The Three Ps
author: Dachary Carey
layout: post
description: In which we dive deeper into what we actually want to know.
date: 2025-03-09 00:11:00 -0000
url: /2025/03/09/audit-what-to-track/
image: /images/audit-overview-hero.png
tags: [Documentation]
draft: true
---

## The Three Ps: Developer docs code example coverage

When you want to find gaps, you need more than info about what you *have*. You need info, or at least theories, about what you *need*. Then you can evaluate what you have against what you need to figure out what's missing.

Having spent weeks spelunking in this space, I have developed a framework to hone in on the business logic that supplies the "what you need" piece of the equation. Let me introduce you to The Three Ps:

- Product
- Persona
- Programming language

You can break each of the Three Ps down into three axes to evaluate code example coverage needs:

- Product surface area
- Complexity and general coverage
- Relative priority to the organization

In the end, you have a framwork resembling:

- Product
  - Product surface area
  - Domain complexity and general coverage
  - Relative priority to the organization
- Persona
  - Product surface area
  - Persona complexity and general coverage
  - Relative priority to the organization
- Programming language
  - Product surface area
  - Programming language complexity and general coverage
  - Relative priority to the organization

### Product

Product is first and core of The Three Ps. Product breaks down into these key areas:

- Product surface area
- Domain complexity and general coverage
- Relative priority to the organization

If your organization has more than one product, examining code example coverage in docs on a per-product basis gives you a more accurate accounting of coverage.

#### Product surface area

Required coverage may vary across the product surface area. A UI, for example, probably needs very few code examples. You might have a UI that takes a JSON blob for configuration, but otherwise UIs generally have very little need for code examples. If you also have a CLI to enable developers to programmatically interact with your product, the CLI part *does* warrant code example coverage. If you also have a bunch of language-specific SDKs or drivers, each of those warrants its own analysis of coverage.

In short, you need to define how your product breaks down into its various surface areas, and which ones warrant code example coverage in your documentation.

#### Domain complexity and general coverage

I have spent years writing documentation for databases. Developers who are looking for databases have generally used a database. They don't need to have general database concepts explained to them; they understand reading, writing, and indexes. What they need is details about and examples of *your specific product's implementation* of this thing. This is true for a lot of domains that aren't inherently complex or where there are a lot of products in the space; developers aren't looking for general conceptual coverage in your docs, but your specific implementation details.

When the domain *is* complex, there isn't good general coverage within the industry, or your implementation varies wildly from a monolithic industry standard, you need a lot more, detailed coverage in both page copy and code examples. For example, the rise of LLMs and AI applications is changing how developers want to store and query data. This is a rapidly evolving space that is currently complicated by a large proliferation of nascent providers, integrations, and implementations. Until there is consolidation and simplification in this space, developers need many and more detailed code examples to inform implementation.

#### Relative priority to the organization

Healthy organizations regularly shift priorities for a variety of reasons; to capitalize on new opportunities, to evolve go-to-market strategy, or to re-align business operations with revenue generation and industry changes. All of these can shift product priority and resourcing within an organization. You can't just define coverage requirements once and track those requirements statically for the lifetime of the business. You must revisit the relative prorioty of a product to the business periodically, and adjust coverage requirements based on those changes.

#### Example



### Programming language

You can break programming language down into the exact same 

- Product surface area
- Programming language complexity and general coverage
- Relative priority to the organization

#### Example

### Persona

#### Example

### How can we understand coverage?

In software testing, developers have a concept of code coverage. Wikipedia says:

> Code coverage is a percentage measure of the degree to which the source code of a program is executed when a particular test suite is run.

If developer documentation is intended to instruct developers in *how* to use our APIs, can we apply a similar metric to evaluate documentation coverage? Maybe we could say:

> Documentation coverage is a percentage measure of the degree to which the APIs of a product are documented.

If we accept that definition, we could say that if an API is omitted from the documentation, it doesn't have documentation coverage. If a product has 10 APIs, and 8 of them are covered by documenation, it has 80% documentation coverage. We could track which APIs are covered by the docs and which are not, plan work to add coverage for missing APIs, and track the execution of that work. We could say at the end of the project we aimed for 100% documentation coverage, and say the project was successful if 10 out of 10 APIs are covered when the project is complete.

That is a lovely simplified way of looking at documentation. If you're a developer who is writing API reference documentation, that's probably a good metric to track! If you're maintianing an API specification, that's definitely a good metric to track.

But product documentation for developer tooling requires more than an API reference.

Let me say that again a little louder for the folks way in the back...

**Product documentation for developer tooling requires more than an API reference!**

The nuances may change depending on the programming language, but an API reference is, at its core, a list of methods, their parameters and types, and what they return.

Developers need more than a list of methods to use a product.

*How much more* depends on - a lot of things. This gets to the heart of the question behind this audit project, and is also not remotely covered by any of the data I have access to.

I spent days digging into the data I *do* have to test various theories and try to answer this question. I have written an 88 page report summarizing my findings, which is currently in review within my team before we share it out to the org and try to find a way to synthesize the info for leadership.

I'll cover some of the most important findings in the *Audit Conclusions* article in this series (coming soon). But for the purpose of what to track, I can enumerate what data I *want* so I can evaluate the data we *have* to find the gaps.