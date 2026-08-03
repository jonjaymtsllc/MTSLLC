# Moore Tutoring Solutions — Website Owner's Manual

A plain-English guide to editing and launching this site. No coding experience needed —
every edit is "open a file in Notepad (or any text editor), find the text, change it, save."

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | Home page |
| `programs.html` | Programs & package pricing |
| `results.html` | Results & testimonials |
| `about.html` | About the company |
| `faq.html` | Frequently asked questions |
| `book.html` | Book a Consultation (call-back form + Calendly calendar) |
| `contact.html` | Contact info + message form |
| `apply.html` | Tutor application page (wire your Google Form here) |
| `css/styles.css` | All colors, fonts, and layout |
| `js/main.js` | Menu, animations, form and booking-button behavior |
| `js/proofPoints.js` | The research stats ("What an ACT score is actually worth") shown on Home and Programs — every number and source link lives here |
| `js/proofSection.js` | Draws that stats section onto the page. Nothing to edit in here |
| `js/editor.js` | The click-and-type editing mode |
| `Edit Website.bat` | Double-click this to edit the site and save changes straight into this folder |
| `tools/` | The small helper that `Edit Website.bat` runs. Nothing to open in here |
| `_backups/` | Appears after your first save — previous versions of each page |

Only the pages, `css/`, and `js/` matter to the live site. `Edit Website.bat`,
`tools/`, and `_backups/` are just for editing on your own computer.

## How publishing works (automatic — no dragging)

This site is already live and deploys itself. There is nothing to drag anywhere.

- **Live site:** https://www.mooretutoringsolutions.com
- **Code lives at:** https://github.com/jonjaymtsllc/MTSLLC
- **Hosted by:** Vercel, project `mts-website`

The chain is: you edit a file in this folder → you commit and push it with
GitHub Desktop → Vercel notices the push and publishes it, usually within a
minute. No build step, because these are plain HTML files.

**To publish a change:**
1. Make your edit and save it (see "Editing any text on the site" below).
2. Open **GitHub Desktop**. Your changed files appear in the left panel.
3. Type a short note in the **Summary** box, like `updated pricing`.
4. Click **Commit to main**, then click **Push origin**.
5. Wait about a minute, then reload the live site.

If a change does not appear, check https://vercel.com/moore-tutoring-solutions-llc/mts-website/deployments —
the newest entry should say **Ready**. If it says **Error**, click it to see why.

**Your domain is already connected.** `mooretutoringsolutions.com` redirects to
`www.mooretutoringsolutions.com`, and the DNS at Squarespace is set correctly.
Nothing in this folder affects that.

**Note on forms:** Vercel does not collect form submissions on its own. Both the
booking form and the contact form email you through FormSubmit instead — each
needs a one-time activation click. See "Wiring up the contact form" below.

## Editing any text on the site (no code needed)

**Double-click `Edit Website.bat` in this folder.** That's the whole setup.

A small black window opens (leave it open — that's what does the saving) and your
browser opens the site with **editing mode** already switched on.

1. Click any text — headlines, paragraphs, buttons, FAQ answers, footer — and type
   your changes. Links are disabled while editing so nothing jumps away.
2. Click **"Save to website folder"** in the dark bar at the bottom.
3. That page's file in this folder is updated immediately. Nothing to move,
   rename, or drag. A green "Saved index.html" line appears in the black window.
4. To edit a different page, click through the menu as normal — editing mode
   stays on as you move around the site.
5. When you're done, close the black window. Then commit and push in GitHub
   Desktop to publish the changes (see "How publishing works" above).

Every save keeps a copy of the previous version in a `_backups` folder, named with
the date and time, so you can always go back. Only the 30 most recent are kept.
You can delete that folder any time. It is listed in `.gitignore`, so it never
gets published to the live site or to the public GitHub repo.

### If you'd rather not use the launcher

You can still edit a page by double-clicking the `.html` file and adding `?edit`
to the end of the address bar (shortcut: **Ctrl+Shift+E**). Opened this way the
browser isn't allowed to write into your folder on its own, so **Save** will either
ask you where to put the file (choose this folder and overwrite the old file) or
fall back to downloading it — in which case move the download into this folder,
replacing the old file. The launcher avoids all of that.

Good to know:

- **The header menu and footer repeat on every page.** If you reword something
  there (like the footer tagline), make the same edit on each page — or make it
  on one page and ask Claude to copy it across the rest.
- Editing mode changes text only. It can't move sections, change colors, or edit
  the light-gray hint text inside empty form boxes — ask Claude for those.
- If Save ever says it couldn't save, the black window was closed. Reopen
  `Edit Website.bat`, then click Save again in the tab you were editing —
  your changes are still on screen as long as you don't reload the page.
- It's harmless if a visitor ever discovers `?edit` on the live site: it only
  affects their own screen and nothing is saved anywhere (the launcher and its
  saving only exist on your computer).

## Things to edit before launch

Search each file for the word `EDIT` — every spot that needs your attention has a
comment starting with `<!-- EDIT:` right above it.

1. **Phone number** — already set to (859) 576-1816 everywhere. If it ever changes,
   find-and-replace `(859) 576-1816` (the visible text) and `+18595761816` (the
   tap-to-dial link) across all the `.html` files.
2. **Prices** — in `programs.html`, look for the big comment `EDIT PRICES HERE`.
   Each package shows a per-month figure up top, and the Score Builder /
   Premium Package cards also show the full-block up-front total in small print. All
   of them are placeholders — change the text inside each
   `<p class="tier__price">` to your real numbers whenever ready.
3. **Results & testimonials** — every sample stat, score story, and quote has a
   yellow "Sample" badge on the page. Replace the text with real results, then delete
   the matching `<span class="placeholder-badge">…</span>` line so the badge disappears.
   They're on `results.html`, `index.html` (two quotes), and `about.html` (team cards).
4. **Team section** — in `about.html`, add your name/photo/bio and your tutors'.
5. **Session format & policies** — a few FAQ answers (online vs. in person, missed
   sessions) have `EDIT` comments; make sure they match how you actually operate.
6. **Research stats (re-check every year)** — the "What an ACT score is actually
   worth" section on Home and Programs is built from `js/proofPoints.js`. WKU
   republishes its scholarship chart every year, so before each academic year
   re-verify every figure in that file against its source link and update the
   `lastVerified` dates. The click-and-type editor deliberately skips this
   section — those numbers are only ever edited in that one file.

## Booking (Calendly)

Every **"Book a Consultation"** button on the site — the blue one in the menu, the
big ones at the bottom of each page, the buttons on the pricing cards — opens your
Calendly scheduler in a popup window over the site. `book.html` shows the same
calendar embedded directly in the page, side by side with a **"Have us call you"
form** that emails the parent's details straight to your inbox so you can prepare
and call them right away.

**One-time form activation (do this before launch):** the form sends through
formsubmit.co — free, no account needed. The first time it's ever submitted,
FormSubmit emails jonjay@mooretutoringsolutions.com an **"Activate"** button
instead of delivering the message. So: open `book.html`, fill the form out
yourself once, submit it, then click Activate in the email you receive. Every
request after that lands in your inbox instantly, formatted as a table, with
the parent's email set as reply-to. The email subject is "New consultation
request — call this parent."

They all point at:

    https://calendly.com/jonjay-mooretutoringsolutions/30min

**To point them somewhere else** (a different meeting type, or a new Calendly
account): open each `.html` file and find-and-replace that whole address with the
new one. It appears in every page, so replace it everywhere — including the
`data-url="..."` line on `book.html`.

**Things to set up on Calendly's side,** since the calendar now collects what the
old form used to ask for: in Calendly go to your event → **Invitee Questions**, and
add the fields you want (student's grade, phone number, "what's going on with school
or the ACT?"). Also check your availability hours there — the site will show
whatever Calendly says is open.

If a visitor has JavaScript turned off, the buttons still work: they just open
Calendly in a new tab instead of a popup.

## Getting paid (Stripe)

**These buttons are live and take real money.** Every pay button on
`programs.html` points at a real Stripe Payment Link on your live account
(Moore Tutoring Solutions LLC). A parent who clicks one is charged.

Five buttons, five links:

| Card | Button | Charge | Stripe product |
|---|---|---|---|
| Minimum | Purchase This Package | $149 every 4 weeks | The Minimum Package |
| Score Builder | Pay Monthly | $999 every 4 weeks | The Score Builder (Monthly) |
| Score Builder | Pay Up Front — Save $248 | $2,749 once | The Score Builder (Up Front) |
| Premium | Pay Monthly | $1,749 every 4 weeks | The Premium Package (Monthly) |
| Premium | Pay Up Front — Save $498 | $4,749 once | The Premium Package (Up Front) |

The buttons deliberately don't repeat the price — it's already in the card above
them. The "Save" figures are the difference between paying up front and making
three monthly payments (3 × $999 − $2,749 = $248; 3 × $1,749 − $4,749 = $498).
**If you change any price, recheck that math.**

Each checkout collects the payer's email, phone, and **the student's full name**,
then shows a thank-you message saying you'll email within one business day.

### Two things to watch

**1. The monthly plans never stop on their own.** Stripe Payment Links can't be
told "bill 3 times and quit." The Score Builder and Premium are 12-week programs,
so after the **third** payment you have to cancel the subscription yourself:
Stripe dashboard → **Subscriptions** → find the customer → **Cancel subscription**.
Put a reminder on your calendar when someone signs up. If you forget, they get
billed a fourth time and you'll owe a refund. (The Minimum Package is meant to run
continuously, so it's fine to leave alone until the family cancels.)

**2. "Per month" actually means every 4 weeks.** That's how the prices were set up
in Stripe. Four weeks isn't a calendar month, so a year-long Minimum Package
subscriber pays 13 times, not 12. For the 12-week programs it works out perfectly
(3 payments = 12 weeks). If you'd rather bill on true calendar months, change the
price in Stripe and tell me — the site wording may need to change with it.

### Changing a price

Change it in **both places** or a parent gets charged something different from
what the page promised: edit the price in the Stripe dashboard, then edit the
matching number in `programs.html`. Note that Stripe prices can't be edited in
place — you create a new price and point the Payment Link at it.

**Invoicing** (for custom quotes after a consultation): in the dashboard go to
**Invoices → Create invoice**, enter the parent's email and the agreed amount, and
send. They pay online, Stripe chases late payments for you, and you can set up
payment plans per-invoice. No website changes needed.

Never paste Stripe **API keys** (they start with `sk_` or `pk_`) into the website
files — this site doesn't need them, and anything in these files is public.

## The tutor Apply page

`apply.html` is where tutoring contractors apply. It's linked from the footer of
every page ("Apply to Tutor"). It lists your requirements — recent high school
graduate, 32+ on ACT Math, set-your-own-hours, pay about double a typical college
job — and ends with an application box.

**Right now** the box shows "Our online application opens soon" with an email
button that works immediately (applicants email jonjay@mooretutoringsolutions.com
with the subject "Tutor application").

**To wire up your Google Form later:**
1. Build the form at https://forms.google.com (suggested questions: name, school
   & year, ACT Math score + upload of score report, weekly availability, why
   they'd be a great tutor).
2. In Google Forms click **Send**, choose the **`< >` (Embed HTML)** tab, and
   copy the `<iframe>` code.
3. In `apply.html`, find the comment `APPLICATION FORM (Google Form goes here)`
   and paste the iframe in place of the placeholder box, exactly as the comment
   describes. Set the iframe's `width="100%"` and a height tall enough for the
   whole form (try `height="1400"`).
4. Commit and push in GitHub Desktop.

A note on the pay claim: the page says tutors earn **"about double what the
typical college job pays."** We deliberately didn't cite LinkedIn — LinkedIn
doesn't publish that stat (the figure going around comes from a blog's informal
LinkedIn poll). For reference, ZipRecruiter puts the average college-student job
at about $16.57/hr, so keep your actual rate around $33/hr or better to make the
claim honest.

## Wiring up the contact form

The message form on `contact.html` emails you through **FormSubmit** — the same
free service the booking form on `book.html` uses. No account, no monthly fee,
and it works on Vercel.

**You must activate it once before it delivers anything.** FormSubmit activates
per form, so doing the booking form does NOT cover the contact form:

1. Open the live contact page: https://www.mooretutoringsolutions.com/contact.html
2. Fill the form out yourself and submit it.
3. FormSubmit emails jonjay@mooretutoringsolutions.com an **"Activate"** button.
   Click it.
4. Send one more test message to confirm it lands in your inbox.

After that, every message arrives instantly, formatted as a table, with the
sender's email set as reply-to so you can just hit Reply. The subject line is
"New message from the website contact form."

**Until you click Activate, messages are not delivered** — the sender still sees
the friendly confirmation, so do step 3 before you send any traffic to the site.

> Heads up: before 2026-08-02 this form was marked up for Netlify Forms, which
> does nothing on Vercel. Messages sent in that window showed a success message
> to the sender but were never delivered anywhere. That is fixed.

## Changing colors or fonts

All colors live at the very top of `css/styles.css` in the `:root { ... }` block —
change a value there and it updates across the whole site. The main ones:

- `--cobalt: #2b4ee6;` — the blue used for buttons and links
- `--highlight: #ffd449;` — the yellow highlighter accents
- `--ink: #10182b;` — the main text color

## A safety net

Editing mode already backs itself up: every save drops a dated copy of the old page
into `_backups`. To undo a change, open that folder, find the version from before,
rename it back to the plain page name (for example `index_2026-08-01_141133.html`
→ `index.html`), and move it up into the website folder.

For anything bigger — before edits by hand, or before launch — copy the whole folder
somewhere as a backup. You can always preview locally by double-clicking any `.html`
file, or by using `Edit Website.bat`.
