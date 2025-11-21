---
title: Test Docs Code Examples
author: Dachary Carey
layout: post
description: In which I explore why you really need to test docs code examples.
date: 2023-10-10 12:00:00 -0500
url: /2023/10/10/test-docs-code-examples/
image: /images/test-docs-code-examples-hero.png
tags: [Documentation, Coding, Writing]
---

When I interviewed to join the Developer Education team at MongoDB, one thing really stood out to me: they maintain their documentation code examples in unit test suites. In fact, they wrote a tool, [Bluehawk](https://github.com/mongodb-university/Bluehawk), to mark up and extract code snippets for use in documentation. They explained to me that this helped them ensure accuracy - the code was free of typos and would compile.

In the nearly three years since I joined the team, I've learned *many* reasons to maintain code examples in test suites. If you write documentation for developers, you should absolutely maintain tested code snippets for your docs. Here's why.

## Tests validate understanding

This was super important for me as a new member of the team. I didn't always understand the SDK code I was documenting. I had to learn how to test code in order to validate my understanding of our APIs. After three years, I'm very familiar with our APIs and how they behave. But tests are still invaluable for helping me understand new features.

Any developer approaches code with a set of assumptions. These assumptions are informed by things like:

- The developer's familiarity with the language and/or framework features
- The developer's general experience level
- The developer's needs or use case for the code
- The language and naming used in the APIs themselves, and in documentation

Two developers may encounter the exact same API and documentation - but may make very different assumptions about how it behaves.

Tests *show* how an API functions. Good tests show how an API is intended to be used. And tests can validate those assumptions.

For example, a teammate and I noticed that some state seemed to persist between docs tests in our Kotlin SDK. I noticed this seemed to happen in cases where we used anonymous authentication. I went digging, and noticed the anonymous credential had an option we hadn't documented - a bool called `reuseExisting`. When I set this bool to `false` in a test, we no longer observed the state persisting between tests. 

This wasn't an option in some of the other SDKs, and it hadn't occurred to us that the SDK was reusing anonymous users - or that there was a way to disable this behavior. We never would have noticed this if we hadn't been testing our code examples. We had assumed every anonymous user was a new, unique user.

## Tests find bugs

The engineering teams that write the libraries we document write tests for their code. But we're all fallible humans. Sometimes we miss testing a specific combination of code paths with new features or APIs, and bugs sneak through. Engineering teams typically write tests that use a specific pattern or level of abstraction that is appropriate for writing a library, but they may not have tests that simulate the ways that a consumer of the APIs may be using them.

The code examples in our documentation try to show developers how to *use* our libraries. So our tests simulate how someone might consume our APIs. Sometimes, we catch bugs when we write these tests. It's always better when we can catch these bugs ourselves and make the engineering teams aware, versus having developers run into these issues after release and face a rush to fix a business-critical bug.

## Tests catch regressions

Earlier this spring, one of our engineering teams did a lot of internal refactoring to prepare for some big new language-specific features. After updating our docs test suite to the new version with the refactoring, a couple of tests were failing in ways that seemed completely unrelated to the changes. I dug in to get more details, and raised the issue with the engineering team. It turned out, there was a regression. The team was able to fix it, and the fix solved my failing tests.

## Tests alert to changes in dependencies or language features

Fast-moving languages or dependencies may be prone to breakages. Maintaining code examples in test suites alerts you when:

- Dependencies or their requirements change
- Language-specific APIs and features are deprecated
- Things *outside* the scope of your library change, necessitating a change to code examples

## Tests help you document how to test

One thing that developers always need, and rarely get, is details about how to test libraries or functionality. If you actually maintain your code examples in test suites, as a *consumer* of your API or SDK, you *learn* how to test your library. And you can provide information to developers about the best ways to test things. Maybe a specific tool or framework is best for testing your library or functionality. Maybe developers should test with mocks. Maybe there's a local backend that developers can perform tests against. 

Or maybe you find out it's really painful to test your library, and can provide feedback to product and engineering to drive improvements for this in the product itself.

## No, really, test your code examples

All of these lessons come from years of maintaining code examples in unit/integration test suites. When I joined our team, they maintained code examples in test suites, but a lot of the code examples weren't actually tested. My teammates, experienced developers, were using the compiler for syntax checking and to avoid typos.

As an experienced documentation writer who was new to development, I had to *learn* how everything worked. I had to check every assumption. I couldn't afford to believe I understood how something was intended to function. I had to prove it. 

The best tool for that was to write tests. 

When I was starting out, I didn't write the best tests. Sometimes I was testing the wrong thing, or I'd find out in a tech review that what I thought I had written didn't actually work that way. But over time, my tests have improved. As they have, the value I've gotten from writing tests - for myself, and for the organization - has improved.

Now, I can say with confidence that I wouldn't want to write code examples for documentation *without* doing it in tests. The quality and accuracy of the working code in our documentation helps developers succeed faster, and improves confidence in our product and our documentation.

## Check it out

What do tests for documentation look like? Here's an example.

- [C++ SDK Code and Test](https://github.com/mongodb/docs-realm/blob/master/examples/cpp/beta/asymmetric/asymmetric-sync.cpp): Test creates a representative example object, writes it, confirms it has persisted to the server, and then deletes it from the server.
- [C++ SDK Documentation Page with Tested Code](https://www.mongodb.com/docs/realm/sdk/cpp/sync/stream-data-to-atlas/): Docs show how to create a representative example object, open a connection to the server, open the database, and write the object.

Essentially, the test *proves* that the code in the documentation page works the way we say it works.

In a future blog post, I'll dive deeper into *how* to test docs code examples. Check out [How to Test Docs Code Examples](https://dacharycarey.com/2024/01/12/how-to-test-docs-code-examples/).
