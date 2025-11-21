---
title: CLI tool version complications
author: Dachary Carey
layout: post
description: In which I attempt to debug a CLI thing and find out I made an assumption.
date: 2021-05-20 15:01:35 +0300
url: /2021/05/20/cli-tool-version-complications/
image: /images/cli-version-hero.jpg
tags: [Coding]

---
I've been playing around with different versions of the `realm-cli` for some documentation projects. That means installing and uninstalling various versions via NPM. I kept getting tripped up on this complication so I'm documenting it here in case other folks find it helpful.

## NPM uninstall

Using `npm uninstall` is simple, right? Just run it with the name of the package you want to uninstall, and maybe pass a few flags like `-g` if needed, and the package is gone. 

So here's what my command line looked like today:

```shell
-> npm uninstall -g realm-cli
-> realm-cli --version
realm-cli version 2.0.0-beta.3
```

Aaand.... that went on for a while. I kept running various permutations of NPM uninstall from different directories with different flags, and every time I checked the `realm-cli --version`, I kept seeing it sitting there, taunting me.

I did what any good burgeoning developer would do. I started down a StackOverflow rabbit hole. I got my first good clue when I found this hint:

```shell
-> npm list -g
```

Aha! This tells me which global libraries are installed and where they're located. I've got four of them, and they're at `/usr/local/lib`:

```shell
bluehawk@0.2.3
m@1.5.6
mongodb-realm-cli@2.0.0-beta.3
npm@7.4.0
```

Now the astute among you will probably spot the problem pretty much immediately. I went a bit further before I figured it out.

I popped into `/usr/local/lib`. Didn't see my `realm-cli` there, but I did see `node_modules`, so I figured that was where I needed to be. Changed directory into there, did a little `ls`, and Bob's your uncle: 

```shell
bluehawk    m   mongodb-realm-cli   npm
```

Oh... wait a minute. I've been doing all kinds of permutations of `npm uninstall realm-cli`. But the name of the thing I'm trying to uninstall is `mongodb-realm-cli`. Even though the tool is all `realm-cli` this and `realm-cli` that, the _name_ of the thing is actually `mongodb-realm-cli`.

Maybe this is something that a more experienced developer would check right away. But this is the first time I can remember encountering a CLI tool whose name is different than the syntax you use to invoke it. When I do the `realm-cli --version` and get back `realm-cli version 2.0.0-beta.3` instead of `mongodb-realm-cli version...`, that reinforces my perhaps naive conflation of package name and the syntax you use to invoke it.

Anywho, I ran into this a few weeks ago when changing versions of the CLI, figured out how to fix it, forgot about it between then and now, and went through the whole dang thing again this morning. Documenting it here for myself, so the next time this happens I can hopefully remember how to resolve it more quickly, and for anyone else who runs into something similar.

## Why does the name not match the syntax?

I'm doing some inferring here, but here's my theory.

MongoDB acquired Realm a couple of years ago. I did a little poking around, and NPM has a `realm-cli` that was last published 4 years ago. My guess is that for some reason, there isn't access to remove that old `realm-cli` package, so MongoDB had to append its name to the front of its version of the `realm-cli` to differentiate it. So if you're using Realm these days, you want `mongodb-realm-cli`.

Now I'm curious how often things like this happen with acquisitions...