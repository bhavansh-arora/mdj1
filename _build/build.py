#!/usr/bin/env python3
"""Build the MDJ Mortgages static site.

Pages are assembled from a shared layout (head, header, footer, mobile
action bar) plus a body. Bespoke page bodies live in _build/pages/*.html;
service pages are generated from the data in services.py.

Run from anywhere:  python3 _build/build.py
Output is written to the repository root as flat .html files.
"""
import html
import pathlib
import re

from services import SERVICES

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "_build"
SITE_URL = "https://mdj1.codebunny.net/"
CALENDLY = "https://calendly.com/mdjmortgages/free-30-minute-discovery-meeting-clone"
WHATSAPP = "https://wa.me/447798819741"

# (file, nav label) for the two dropdowns and the flat links.
MORTGAGE_MENU = [
    ("first-time-buyers.html", "First-time buyers"),
    ("moving-home.html", "Moving home"),
    ("remortgage.html", "Remortgage"),
    ("self-employed.html", "Self-employed"),
]
ABOUT_MENU = [
    ("about.html", "About us"),
    ("reviews.html", "Reviews"),
    ("fees.html", "Our fees"),
    ("faq.html", "FAQs"),
    ("refer-a-friend.html", "Refer a friend"),
]
FLAT_LINKS = [
    ("equity-release.html", "Equity release"),
    ("protection.html", "Protection"),
    ("calculators.html", "Calculators"),
]


def partial(name):
    return (SRC / "partials" / f"{name}.html").read_text()


def include(body):
    """Replace {{> name}} with partials/name.html."""
    return re.sub(r"\{\{>\s*([\w-]+)\s*\}\}", lambda m: partial(m.group(1)), body)


def link(href, label, current):
    cur = ' aria-current="page"' if href == current else ""
    return f'<a href="{href}"{cur}>{label}</a>'


def dropdown(label, items, current, key):
    active = " is-active" if any(h == current for h, _ in items) else ""
    links = "\n".join("          " + link(h, l, current) for h, l in items)
    return f"""      <div class="dd{active}">
        <button type="button" class="dd-btn" aria-expanded="false" aria-controls="dd-{key}">{label}<svg aria-hidden="true"><use href="#i-chev"/></svg></button>
        <div class="dd-menu" id="dd-{key}">
{links}
        </div>
      </div>"""


def header(current):
    flat = "\n".join("      " + link(h, l, current) for h, l in FLAT_LINKS)
    return f"""<div class="topbar">
  <div class="wrap">
    <span class="tb-left">Mon–Fri 9:00–18:00 · Free first consultation, face-to-face, video or phone</span>
    <span class="tb-right">
      <a href="tel:+441256518318">01256 518318</a>
      <a href="mailto:mark@mdjmortgages.com">mark@mdjmortgages.com</a>
    </span>
  </div>
</div>

<header class="nav">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="MDJ Mortgages home">
      <span class="brand-mark" aria-hidden="true">MDJ</span>
      <span><span class="brand-name">MDJ Mortgages</span><span class="brand-sub">Basingstoke · Hampshire</span></span>
    </a>
    <nav class="nav-links" id="navlinks" aria-label="Main">
{dropdown("Mortgages", MORTGAGE_MENU, current, "mortgages")}
{flat}
{dropdown("About", ABOUT_MENU, current, "about")}
      {link("contact.html", "Contact", current)}
    </nav>
    <div class="nav-cta">
      <a class="btn btn-gold hide-sm" href="contact.html">Book a free call</a>
      <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="navlinks" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
    </div>
  </div>
</header>"""


def page(file, title, description, body, current=None):
    current = current or file
    canonical = SITE_URL + ("" if file == "index.html" else file)
    return f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{'<base href="/">' if file == "404.html" else ""}
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description)}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="theme-color" content="#141210">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{partial("icons")}
{header(current)}

<main id="main">
{include(body)}
</main>

{partial("footer")}
<script src="assets/site.js" defer></script>
</body>
</html>
"""


def read_page(name):
    """Bespoke page: first lines are 'key: value' metadata, then '---', then body."""
    text = (SRC / "pages" / name).read_text()
    meta_block, body = text.split("\n---\n", 1)
    meta = dict(line.split(": ", 1) for line in meta_block.strip().splitlines())
    return meta, body


def li(items):
    return "".join(f"<li>{i}</li>" for i in items)


def service_body(s):
    cards = "\n".join(
        f"""        <article class="feature reveal">
          <svg class="feature-ic" aria-hidden="true"><use href="#{c.get('icon', 'i-check')}"/></svg>
          <h3>{c['title']}</h3>
          <p>{c['text']}</p>
        </article>"""
        for c in s["cards"]
    )
    faqs = "\n".join(
        f'      <details{" open" if i == 0 else ""}><summary>{q}<span class="pm" aria-hidden="true"></span></summary><div class="ans">{a}</div></details>'
        for i, (q, a) in enumerate(s["faqs"])
    )
    checklist = li(s["checklist"])
    goal = s["goal"].replace(" ", "%20")
    tool = include(s.get("tool", ""))
    review = s["review"]
    # Alternate section backgrounds; the countdown tool brings its own tint.
    has_tool = bool(s.get("tool"))
    list_bg, review_bg, faq_bg = ("", "tint", "") if has_tool else ("tint", "", "tint")
    n = f" n{len(s['cards'])}" if len(s["cards"]) == 4 else ""
    return f"""
<section class="page-hero dark">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span>{s['crumb']}</span></nav>
    <p class="eyebrow">{s['eyebrow']}</p>
    <h1>{s['h1']}</h1>
    <p class="lede">{s['lede']}</p>
    <div class="hero-ctas">
      <a class="btn btn-gold" href="contact.html?goal={goal}"><svg aria-hidden="true"><use href="#i-cal"/></svg>{s['cta']}</a>
      <a class="btn btn-ghost" href="{WHATSAPP}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-chat"/></svg>WhatsApp Mark</a>
    </div>
  </div>
</section>

{{{{> trust}}}}

<section>
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">How we help</p>
      <h2>{s['help_h2']}</h2>
      <p class="lede">{s['help_lede']}</p>
    </div>
    <div class="features{n}">
{cards}
    </div>
  </div>
</section>

{tool}

<section class="{list_bg}">
  <div class="wrap split">
    <div class="reveal">
      <p class="eyebrow">{s['list_eyebrow']}</p>
      <h2 class="h2">{s['list_h2']}</h2>
      <p class="lede" style="margin-top:16px">{s['list_lede']}</p>
    </div>
    <ul class="checklist reveal">{checklist}</ul>
  </div>
</section>

<section class="{review_bg}">
  <div class="wrap">
    <figure class="pull reveal">
      <span class="stars" aria-label="5 stars">★★★★★</span>
      <blockquote>“{review[1]}”</blockquote>
      <figcaption>{review[0]}, Google review · <a href="reviews.html">Read more reviews</a></figcaption>
    </figure>
  </div>
</section>

<section class="{faq_bg}" id="faq">
  <div class="wrap faq-grid">
    <div class="reveal">
      <p class="eyebrow">Questions</p>
      <h2 class="h2">{s['crumb']} FAQs</h2>
      <p class="lede" style="margin-top:16px">More answers on our <a href="faq.html">FAQ page</a>, or message Mark on <span class="mono">07798 819741</span>.</p>
    </div>
    <div class="reveal">
{faqs}
    </div>
  </div>
</section>

{{{{> cta}}}}
"""


def main():
    written = []
    for name in sorted((SRC / "pages").glob("*.html")):
        meta, body = read_page(name.name)
        out = meta.get("file", name.name)
        (ROOT / out).write_text(page(out, meta["title"], meta["description"], include(body), meta.get("current")))
        written.append(out)
    for s in SERVICES:
        body = include(service_body(s)).replace('<section class=""', "<section")
        (ROOT / s["file"]).write_text(page(s["file"], s["title"], s["description"], body))
        written.append(s["file"])
    print("Built", len(written), "pages:", ", ".join(sorted(written)))


if __name__ == "__main__":
    main()
