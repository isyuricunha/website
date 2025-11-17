---
title: About
description: 'committing changes to my life database every day'
author: Yuri Cunha
---

## WHO AM I

I am Yuri Cunha, a Brazilian guy who decided to take computers, databases and homelabs a bit too seriously.

On the internet I usually show up as **"Yuri Cunha"**, although my full name is longer in real life. This site is where I put a good part of my experiments, notes, labs and random ideas.

If you like databases, Linux, self hosting, local AI and long term projects that do not look perfect from day one, you are in the right place.

---

## In one paragraph

I am a Database Technology student, an aspiring PostgreSQL and MongoDB DBA, a homelab owner who likes to self host things, and a person on a long term project to get lighter and run further. I care about practical knowledge, documentation, reliability and having real examples to point to, not just theory. I like tech, but I also like sleep, so I try to build systems I can debug at three in the morning without going insane.

---

## A bit of background

Some quick facts about me:

- I am from Brazil.
- I usually present myself as **DBA PostgreSQL Jr** or similar roles.
- I enjoy working close to infrastructure and databases, not only the top layer of the stack.
- Politically I tend to be more conservative, although this site is mainly about tech and personal projects, not politics.
- English is not my first language; you will probably find some weird sentences here and there.

I like being honest about where I am in my journey. I am not a senior architect with thirty years of experience. I am someone building that path, one lab and one project at a time.

---

## What I am doing in tech right now

On the formal side, I study **Database Technology** at Estácio, a technologist degree focused on databases. The plan is to finish around 2026 or 2027 and, along the way, connect what I study in college with real projects in my homelab and in my repositories.

On the practical side, my routine usually involves:

- taking care of **Linux servers**, mostly Ubuntu Server 24.04 LTS
- working with **PostgreSQL** as my main relational database
- using **MongoDB** for document based scenarios
- creating and maintaining **Docker Compose** stacks
- practicing backup, restore and disaster recovery
- tuning queries and database settings for better performance
- setting up monitoring and alerts
- documenting everything in Markdown so future me does not hate past me

I also spend time studying and preparing for certifications and professional opportunities related to databases, infrastructure and security.

---

## My homelab and infrastructure

I like to say that my homelab is my best teacher.

Some things that live there:

- Home servers running **Ubuntu Server 24.04 LTS**, including:
  - a more powerful machine focused on databases and services
  - a lighter machine that I still use for experiments
- **Oracle Cloud** instances that act as extra nodes and database hosts
- **Tailscale** to connect everything in a secure overlay, including my Windows laptop
- **Cloudflared** tunnels to expose services without opening random ports to the internet
- **Random external ports** mapped to containers, instead of defaults, as a small extra layer against bots
- A dedicated database server on Oracle where I centralize databases like PostgreSQL and others

Typical services that appear and disappear here:

- Nextcloud for files
- Joplin Server for notes
- PrivateBin for quick text sharing
- Self hosted monitoring tools
- Local AI models through Ollama
- Small web apps to support my workflow

I own the domain **`yuricunha.com`**, and many services live on subdomains like `something.yuricunha.com`. This site is one of the visible faces of all that.

---

## Tech stack and preferences

These are some tools and choices that appear a lot in my projects:

- **Operating systems**
  - Ubuntu Server 24.04 LTS on servers
  - Windows 10 Pro on my main laptop
  - Arch based distros on the side for experiments, like EndeavourOS, CachyOS and Garuda
- **Networking and access**
  - Tailscale for secure remote access
  - Cloudflared for publishing services without touching router port forwarding
- **Containers and services**
  - Docker with **docker compose** (the plugin, not the old `docker-compose` command)
  - `docker-compose.yml` files without the old `version` key
  - external PostgreSQL instead of one database per container
  - fixed DNS in containers using:
    - `1.1.1.1`
    - `8.8.8.8`
- **Programming and tools**
  - Python for automation and scripts
  - `pipx` to install Python based tools globally but cleanly
  - shell scripts for simple tasks
- **Databases**
  - PostgreSQL as the main database in my labs
  - interest in MongoDB and other engines to compare approaches
- **AI and automation**
  - Ollama running on Ubuntu, directly on the host, not in containers
  - tests with different models and prompts
  - plans for personal automations and assistants

I like setups that are reproducible. If I write a compose file or a script, I try to make it so that I can recreate the same environment months later without guessing.

---

## Labs, repos and documentation style

One of my main long term projects is building a **DBA lab and portfolio**, focused on PostgreSQL.

Things you can expect from my repos:

- structured directories for each service or lab, for example:
  - `~/docker/docker-compose/{service}`
  - `~/docker/docker-data/{service}`
- `docker compose` files that:
  - avoid deprecated options
  - use external databases where it makes sense
  - include sample environment values, so it is clear what goes where
- documentation written in Markdown, usually in first person, with sections explaining:
  - what changed
  - how it changed
  - why it changed
- comments in code in **lowercase**
- SQL queries mostly in **lowercase**
- preference for open source licenses, often **LGPL 2.1** in public projects

I like to treat these labs as mini production environments. Even if no one else uses them, I act as if I am the DBA, the sysadmin and the on call person at the same time.

---

## Side projects and personal brands

Besides pure infra and databases, I also enjoy creating small projects and brands, both for fun and for practice.

Examples:

- ideas around a personal music app, similar to **YuMusic**, using self hosted backends
- small brand concepts like **YuFlow** and others
- experiments with a personal AI avatar and assistant for support or chat
- services under **YC Inc.** style naming, for a future personal business presence

These things evolve over time. Some of them may never go public, but the work behind them helps me learn about pipelines, CI, versioning, security and deploys.

---

## Study style and mindset

How I like to study and grow in this area:

- mix **theory and practice** all the time
- break things on purpose, then fix them
- keep **detailed notes** of commands, outputs and decisions
- create **runbooks** for repetitive or stressful tasks, for example:
  - restoring backups
  - reconfiguring a cluster
  - doing maintenance with minimal downtime
- focus on **observability**:
  - logs
  - metrics
  - alerts
- revisit old labs with fresh knowledge to see what I would do differently now

I prefer understanding how things work under the surface instead of memorizing a list of commands. If I know where the logs are, how the process starts, how the data is stored and what the configuration does, I feel much more comfortable touching production systems.

---

## Career direction

Professionally, I am building my path in roles like:

- Junior DBA PostgreSQL
- Database Administrator focused on production environments
- roles where PostgreSQL and Linux are first class citizens
- positions where observability, performance tuning and reliability matter

I also keep an eye on areas related to:

- data engineering
- security and compliance
- high availability and clustering

I have gone through real recruitment processes, including multi step interviews for DBA roles, and I use each experience to refine my portfolio, my labs and how I present my skills.

---

## Health, running and long term goals

Tech is not the only long term project in my life.

I have been working on:

- **losing weight**
- **improving my health markers**
- **building a running habit**

Some tools and habits that I use:

- **Garmin** watch and **Garmin Coach** plans, especially for 5K
- structured training plans that mix run and walk
- tracking **steps, distance and pace**
- using **food scales** and apps to measure calories and macros
- planning meals with simple, repeatable options like rice, beans, eggs, pasta and basic sides
- trying to keep a consistent **calorie deficit** without going into extremes

I know I am a big guy and that this will take time. My goal is not only to drop numbers on the scale, but to build a body that can handle my plans, including running regular 5K races and, later, longer distances.

You may see posts about:

- weekly training summaries
- how a specific run went
- small improvements in heart rate and pace
- experiments with diet and routine

I see this health journey in the same way I see my homelab. It is a long project, full of iterations, metrics and adjustments.

---

## How I use this site

This site exists for a few reasons:

- to centralize my **notes, labs and guides**
- to act as a **portfolio** for people who want to know what I actually do
- to keep a **log of my learning** over time
- to share **configs, compose files and scripts** that might help others
- to document my **running and health journey** in a way that makes sense to me

You may find here:

- technical articles about PostgreSQL, Linux and Docker
- step by step guides for specific setups
- small reflections on study, career and life
- notes about training, weight loss and discipline

I prefer being honest over being perfect. So you will probably see drafts, work in progress, and things that changed halfway through. To me, that is better than pretending everything is finished and polished.

---

## What I value

A few things that guide how I work and learn:

- **clarity** over buzzwords
- **documentation** over improvisation
- **reliability** over shiny but fragile setups
- **personal responsibility** over blaming tools
- **freedom and privacy** in tech
- being **realistic** about current skills, while pushing to improve

In practical terms, this means I like:

- logs, metrics and alerts instead of guesswork
- automation with clear behavior
- backups that I have actually restored and tested
- observability instead of blind faith in services
- self hosted or at least controllable tools when possible

---

## Random facts about me

Just to make this page a bit more human:

- I can get happily lost configuring a new Linux environment for hours.
- I enjoy tweaking kernels and performance options for my Ryzen laptop.
- I like to read about databases even when I am not strictly required to.
- I prefer quiet environments over noisy places.
- I think a good walk or run solves a lot of mental clutter.
- I use AI models, both local and in the cloud, as tools to think, draft and explore ideas.

---

## If you read all this

If you made it this far, thank you.

If you want to say hello, comment on something, propose a project or just tell me that a post helped you, you can go to the [Contact](/pages/contact) page and send a message.

This site will probably keep changing over time, just like I am changing the things I do and the person I am becoming. That is part of the fun.
