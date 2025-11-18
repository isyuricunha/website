---
title: Hardware
description: 'committing changes to my life database every day'
author: Yuri Cunha
---

This page is a simple inventory of the hardware I use right now.

Nothing here is marketing. It is just a list of the machines that keep my life and my lab running.

I split things into:

- personal notebook
- home lab main server
- home lab ARM64 node
- cloud dev and prod machines
- a short note on why this mix exists

---

## Personal hardware

### Main notebook

This is my daily driver. I use it for everything related to study, code, SSH, docs and general work.

**Specs**

- CPU  
  - **AMD Ryzen 7 7445HS**
- RAM  
  - **64 GB DDR5**
- Storage  
  - **256 GB** SSD  
  - **360 GB** SSD  
  - used for system, dev tools, local databases, containers and files
- GPU  
  - **Nvidia RTX 4070** (notebook)

Main use cases:

- terminals and IDEs to work on code and documentation
- SSH into all lab and cloud machines through Tailscale
- database clients, admin tools and dashboards
- browsers and apps that talk to services running in the lab
- some local containers and light VMs when needed

This notebook is the place where I drive everything else.

---

## Home lab hardware

### Main server at home

This is the big machine in the homelab, focused on databases, services and experiments.

**CPU**

- **Intel Xeon W9 3475X**

**Memory**

- **256 GB ECC R**
- **256 GB ECC R** in mirror configuration  
- total of **512 GB** of ECC memory, configured for redundancy to avoid failures

**Storage**

Rotational storage:

- **14 TB HDD** main data
- **14 TB HDD** for redundancy  
- **14 TB HDD** for backups

NVMe storage:

- **256 GB NVMe** for the system
- **500 GB NVMe** used as file cache
- **4 TB NVMe** for cold files and long term storage

**GPUs**

- **Nvidia GT210** for video output
- **Nvidia GT 1050** for small workloads and video codecs
- **AMD Radeon RX 7900 XTX** for AI workloads

I will replace all nvidia and intel stuff for AMD in some moment

Typical usage:

- PostgreSQL and other databases in real lab style setups
- Docker/Containers stacks for self hosted services
- monitoring, logging and backup jobs
- AI experiments using the RX 7900 XTX
- storage for media, backups and lab data with redundancy

This is the core of the home lab and where most heavy work happens.

---

### ARM64 node in the home lab

I also keep an ARM64 environment at home for testing and variety.

**Board**

- **Raspberry Pi 5**, 16 GB version

**SoC**

- **Broadcom BCM2712**
- quad core **ARM Cortex A76**

**Memory**

- **16 GB LPDDR4X 4267**

**Storage**

- **64 GB eMMC** module for the system
- **512 GB** drive for containers and files

Use cases:

- running ARM containers
- testing services on ARM64 before going to cloud ARM
- small always on services with low power usage
- experiments with storage on small boards

This node helps me make sure my setups are not x86 only.

---

## Cloud hardware

I also run dev and prod workloads in the cloud. Right now there are two main groups of VMs.

### x86 64 dev and prod in the cloud

These are two virtual machines with the same hardware, one for dev and one for prod.

**Specs per VM**

- CPU  
  - **AMD EPYC 7551**, **8 vCPU**
- RAM  
  - **16 GB**
- Storage  
  - **250 GB** for system, data and logs

There are **two** of these machines with the same configuration.

Main use:

- running databases and services in a more realistic production like environment
- testing deployments that talk to the home lab through Tailscale
- simulating scenarios where part of the stack is on premises and part is in the cloud

---

### ARM64 dev and prod in the cloud

I also keep ARM64 machines in the cloud for tests and workloads that make sense on that architecture.

**Specs per VM**

- CPU  
  - **8 vCPU**
- RAM  
  - **24 GB**
- Storage  
  - **150 GB** for system and data

idk what machine is, and i dont care about that

Used for:

- running ARM64 containers and services
- checking performance differences between ARM and x86 setups
- experiments with energy efficient style workloads

Again, the idea is to have at least dev and prod separated in this group.

---

## Why this mix of hardware

The hardware is not random. It follows a simple idea.

- the notebook is the control center
- the home lab main server is where heavy work and storage live
- the home ARM64 node gives me variety and low power experiments
- the cloud machines let me simulate more realistic production setups

With this combination I can:

- test databases and services with serious memory and storage at home
- run AI workloads locally using the RX 7900 XTX
- keep redundancy and backups with mirrored RAM and multiple HDDs
- compare x86 and ARM64 behavior
- practice dev, staging and prod style separation

This page is mostly for me to remember what I actually have, but if you are reading this and you like homelabs, you now know what is running behind the scenes.
