---
layout: post
title: "The Ultimate 'Oops': How I Recovered a Deleted Admin Account on a Locked-Down PC"
date: 2026-03-31
categories: [IT Support, Troubleshooting]
description: "The admin account was deleted. The PC was locked. The password was gone. Here's the exact step-by-step process I used to recover full access — using only what Windows gives you."
image: /assets/images/blog_header.png
image_width: 1920
image_height: 1080
featured: false
---

We’ve all had those heart-drop moments in IT. For me, it happened recently while preparing a fleet of Lenovo PCs for an upcoming batch of IGCSE exams. I ran a cleanup script designed to wipe old student profiles, but it worked a little *too* well... it completely deleted the one and only local Administrator account.

Suddenly, I was staring at a standard Student login screen with absolutely zero permissions to fix the system. Here is the story of the hurdles I faced trying to reclaim my system, and the backdoor hack that ultimately saved the day.

### Hurdle 1: The Secure Boot Blockade
My first instinct was to reach for my trusty **MediCat USB** (a bootable IT toolkit loaded with password recovery tools). I popped it in, hammered the F12 key to open the Boot Menu, selected the USB, and was instantly hit with a brick wall: **"Check Security Boot Policy."**

The Lenovo PC had "Secure Boot" enabled, which aggressively blocks unofficial bootable drives. "No problem," I thought, "I'll just go into the BIOS and turn Secure Boot off."

*Denied.*
The setting was greyed out. The BIOS was locked down by an unknown Supervisor Password set by the manufacturer or a previous admin. I was completely blocked at the hardware level.

### Hurdle 2: The "Ghost OS" Trap
Realizing I couldn't use my USB, I pivoted to a built-in Windows trick. From the login screen, I held the **Shift** key and clicked **Restart**. This forced the computer into the blue "Advanced Startup" menu, where I successfully launched the emergency Command Prompt.

I confidently typed the commands to recreate my admin account:
`net user Admin MyPassword /add`

The screen said *"The command completed successfully!"* I breathed a sigh of relief and restarted the computer. But when the login screen loaded... the admin account wasn't there.

**The Lesson:** When you open Command Prompt from the blue recovery screens, you aren't actually inside your real Windows system. You are operating inside a temporary, invisible "Ghost OS" called **Windows PE** (running on the temporary `X:` drive). Any users you create there vanish into thin air the second you restart!

<img src="/assets/images/ghost_vs_real.png" alt="Ghost OS vs Real Windows OS" style="width:100%; border-radius: 8px;" />

### The Ultimate Solution: The 'Utilman' Hack
To actually fix the computer, I had to trick that "Ghost OS" into leaving a backdoor open on my *real* operating system. If you ever find yourself in this situation, here is exactly how to do it.

**Step 1: Infiltrating the Real Drive**
I went back into the blue Advanced Startup Command Prompt. Instead of creating a user, I needed to locate my real Windows installation. I typed `C:` and pressed Enter.
*(Pro-tip: On some computers, temporary recovery drives push your real hard drive to the letter `D:`. If `C:` throws an error, don't panic, just try `D:`).*

Next, I navigated to the core system folder:
`cd Windows\System32`

**Step 2: Setting the Trap**
Now for the hack. I decided to temporarily replace the "Accessibility / Ease of Access" button on the Windows lock screen with a Command Prompt.

<img src="/assets/images/utilman_swap.png" alt="Swapping utilman.exe for cmd.exe" style="width:100%; border-radius: 8px;" />

First, I renamed the original accessibility tool to back it up:
`ren utilman.exe utilman.exe.bak`

Then, I copied the Command Prompt and disguised it as the accessibility tool:
`copy cmd.exe utilman.exe`

**Step 3: Reclaiming the Throne**
I closed the black box and restarted the computer normally. When I reached the standard Windows lock screen, I didn't log in. Instead, I looked in the bottom-right corner and clicked the little **Accessibility icon**.

Because of my disguise, an elevated, pitch-black **Command Prompt sprung open right on top of the lock screen.**

Because I was *finally* inside the real operating system, my commands permanently worked:
`net user Admin ICT2022 /add`
`net localgroup Administrators Admin /add`

I closed the box, and there it was: the Admin account was fully restored.

### Final Thoughts
This journey was a masterclass in understanding how Windows environments truly work. If you ever find yourself locked out, remember: never trust the `X:` drive, always verify your drive letters, and when in doubt, the `utilman.exe` trick remains one of the greatest, most reliable backdoors in local IT support.
