---
title: 'Learning to code: redux'
author: Dachary Carey
layout: post
description: In which I complete a beginner programming class - in Python!
date: 2020-05-19 15:01:35 +0300
url: /2020/05/19/learning-to-code-redux/
image: /images/learning-to-code-redux-hero.jpg
tags: [Coding]

---
A little over a year ago, I wrote here about how I was learning Swift because there are a couple of apps I want to write. I've gone through a few courses online, and had started working through an Everyone Can Code book: _AP Computer Science Principles with Swift_. I was making good progress, had done the data modeling for my "main" app, but then got a little overwhelmed with the idea of actually starting it. Like, how does a n00b sit down and begin writing an app for the first time?  
  
Then came some health issues last fall, and then Christmas, and then this spring the whole world has turned upside down...  
  
So here we are a year later, and I haven't written my apps, although I've been getting cozier with the code needed to modify the functionality in the static site generators we use for work (Jekyll and Hugo) and my Git foo has gotten to be second nature. But the actual proper "learning to code" I had wanted to do has been nagging away at me. So when one of my co-workers posted that [Stanford University's Engineering department was offering a free intro to coding class, Code in Place][1], I jumped at the chance to sign up.

Fast forward to six weeks later. I was one of 10,000 interested geeks-in-training who got accepted in this massive international experiment of teaching a diverse student base how to code in Python, entirely online. 

I attended all the "sessions" - video chat classes, of sorts, consisting of a group of 10 students working under a "section leader" to practice solving various problems with code. I've watched 14 recorded lectures via YouTube, led by Stanford instructors, and have worked through all of the slides and code from each lecture. I've learned about decomposition, control flow, images, graphics, and animation - in addition to things like variables, expressions, functions, lists, and dictionaries - all the fundamentals to build a solid coding foundation.

My "deliverables" for class have included three assignments, which I uploaded to an autograder to see if they functioned and passed various tests. I also did a "diagnostic" to help determine which concepts I understood thoroughly, and where I needed additional help. (That was supposed to take an hour, but it took me an hour and 40 minutes - but I worked through the whole dang thing, without bothering my husband the experienced web dev for help, until I got it all done and it all worked.)

Now, we've arrived at the final week of class, and I'm doing a final project. For this final project, I'm writing an app! Finally. Not one of the apps I had planned to write a year ago; this is a new idea, which is based on a recent experience I had at work and seems well-suited to be a Python project.

Here's the premise: the technical documentation I write at work contains screenshots. The screenshots are images taken on various pages of our app. When we make changes to the app's UI, I need to update the screenshots to reflect the new UI. Sometimes that's easy, like when the User Profile options change, I know I need to update docs around the user profile. But what about things like adding a git provider, or changing the API key, which are options that you get to through the User Profile menu? It might not be obvious to me that I need to update those screenshots in seemingly unrelated sections of the documentation.  
  
For my Code in Place final project, I've decided to write an app to solve this issue: a screenshot inventory tool, which can call out to a visual diffing tool, and then return to me a list of screenshots I need to update based on pages that have visual diffs. 

So far, I've got the screenshot inventory piece working; I can create a list of all the screenshots in my technical documentation, and associate those screenshots with URLs in the app (dictionaries are awesome). I added some fun calculations to tell me how much coverage I've got in this screenshot inventory; for example, I've got 181 screenshots in my documentation, but have only inventoried 14 of them so far, so roughly 7% of my screenshots have been inventoried. I'll work toward 100% coverage, because that becomes more important when I get the second piece working: the visual diffing element.

For the visual diffing element, I'm learning how to make API calls to [a visual regression tool, Diffy][2], that can generate visual diffs of pages across environments. So I can have it diff production and staging, for example, and tell me which of the pages that I'm tracking contain changes in staging. Then my app will give me a list of the screenshots associated with that page, so I'll know which screenshots I need to update when there are changes to the app.

Bonus: the process of making these associations has made me realize there are some nearly duplicate screenshots in my technical docs, which could be streamlined a bit. So hopefully this exercise will help me tighten up my documentation images and maintain fewer assets. Bonus win!

I'm handling a lot of this data storage and processing in JSON. Code in Place didn't cover writing to files, so I don't have databases and am trying to keep the scope small enough to finish a final project in a week (while also working a full-time job and prepping my veggie garden for spring). Fortunately, my data storage needs are simple, and JSON lends itself well to API calls, so that helps.

API calls are also out of scope of what we learned in Code in Place, but I've documented APIs before and am familiar enough with the basic functionality that I'm hopeful I can get that part working before the final project is due. If not, I've got the screenshot inventory part working, and can always keep working toward the visual diffing processing after class is "over."

At this point, though, I think I can finally check off the box that says: "learning to code." I've written an app that does a thing, and it's a step beyond the Hello World type stuff I've done so far in Swift. I'm enjoying the problem solving; I spend a couple of hours every evening working on code, and go to sleep with code in my head and wake up with problems solved. I might eventually pick up a Python web framework and give it a web UI, or maybe I'll leave it a command-line tool and change gears back to Swift now that I've actually _started_ and _written_ a thing.

Or maybe I'll go even deeper down the rabbit hole, because learning is fun, and poke the Python/Swift interoperability stuff and give it an iOS app. Why not? The sky's the limit once you're well and truly started down the path of programming.

 [1]: https://engineering.stanford.edu/news/free-coding-education-time-covid-19
 [2]: https://diffy.website/