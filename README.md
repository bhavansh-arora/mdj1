# MDJ Mortgages concept site

Static multi-page site for MDJ Mortgages, Basingstoke. Live at https://mdj1.codebunny.net/ (GitHub Pages).

## Pages

| Page | File |
| --- | --- |
| Home (hero calculator, services, award, reviews) | `index.html` |
| First-time buyers | `first-time-buyers.html` |
| Moving home | `moving-home.html` |
| Remortgage (with fixed-rate countdown) | `remortgage.html` |
| Self-employed & contractors | `self-employed.html` |
| Equity release & later life | `equity-release.html` |
| Protection & insurance | `protection.html` |
| Calculators (borrowing, repayments, remortgage timing) | `calculators.html` |
| About | `about.html` |
| Reviews | `reviews.html` |
| Fees | `fees.html` |
| FAQs | `faq.html` |
| Contact (3-step enquiry form) | `contact.html` |
| Refer a friend | `refer-a-friend.html` |
| Not found | `404.html` |

Shared styles and scripts are in `assets/site.css` and `assets/site.js`.

## Editing

The `.html` files in the root are generated. Edit the sources in `_build/`, then rebuild:

```sh
python3 _build/build.py
```

- `_build/build.py`: page layout, header, navigation
- `_build/services.py`: copy for the six service pages
- `_build/pages/`: bodies of the other pages
- `_build/partials/`: shared blocks (footer, trust strip, award, process, countdown, call-to-action)

Links like `contact.html?goal=Remortgage` open the enquiry form with that option already chosen.

`PITCH.md` holds the pitch ideas and the draft reply to Mark.
