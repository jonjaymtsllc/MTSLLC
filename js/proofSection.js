/* Moore Tutoring Solutions — "What an ACT score is actually worth"
   Draws the research-backed proof section into every
   <section data-proof-points> placeholder on the page, using the stats
   in js/proofPoints.js. That data file is the single source of truth —
   no number or source is ever typed here or in the .html files.

   Load order matters: include js/proofPoints.js first, then this file,
   then js/main.js (so the reveal animations pick up the new cards). */
(function () {
  "use strict";

  var points = window.MTS_PROOF_POINTS;
  var hosts = document.querySelectorAll("[data-proof-points]");
  if (!points || !points.length || !hosts.length) return;

  /* Same Calendly event every booking button on the site points at.
     If the site's Calendly address ever changes, the README's
     find-and-replace across all files covers this one too. */
  var CALENDLY_URL = "https://calendly.com/jonjay-mooretutoringsolutions/30min";

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function sourceLink(name, url) {
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = name;
    return a;
  }

  function buildCard(point) {
    var card = el("article", "card proof-card reveal");
    /* data-countup makes the big number animate up from zero when it scrolls
       into view — handled by js/main.js. */
    var headline = el("p", "proof-card__num", point.headline);
    headline.setAttribute("data-countup", "");
    card.appendChild(headline);
    card.appendChild(el("p", "proof-card__detail", point.detail));

    var source = el("p", "proof-card__source");
    source.appendChild(document.createTextNode("Source: "));
    source.appendChild(sourceLink(point.sourceName, point.sourceUrl));
    if (point.secondarySourceName && point.secondarySourceUrl) {
      source.appendChild(document.createTextNode(" · "));
      source.appendChild(
        sourceLink(point.secondarySourceName, point.secondarySourceUrl)
      );
    }
    card.appendChild(source);
    return card;
  }

  for (var i = 0; i < hosts.length; i++) {
    var host = hosts[i];
    host.className = "section section--tight";
    host.innerHTML = "";

    var headingId = i === 0 ? "proof-heading" : "proof-heading-" + i;
    host.setAttribute("aria-labelledby", headingId);

    var wrap = el("div", "wrap");

    wrap.appendChild(el("p", "eyebrow", "What the research says"));

    var heading = el("h2", null, "What an ACT score is actually worth");
    heading.id = headingId;
    wrap.appendChild(heading);

    wrap.appendChild(
      el(
        "p",
        "lead",
        "Three findings from published research on what a score can mean for admission, scholarship money, and earnings after graduation."
      )
    );

    var grid = el("div", "card-grid");
    for (var p = 0; p < points.length; p++) {
      grid.appendChild(buildCard(points[p]));
    }
    wrap.appendChild(grid);

    wrap.appendChild(
      el(
        "p",
        "proof-foot",
        "Figures verified August 2026. Scholarship charts change annually."
      )
    );

    var cta = el("p", "proof-cta");
    var btn = document.createElement("a");
    btn.className = "btn btn--primary btn--lg";
    btn.href = CALENDLY_URL;
    btn.setAttribute("data-calendly", "");
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.textContent = "Book a Free Consultation";
    cta.appendChild(btn);
    wrap.appendChild(cta);

    host.appendChild(wrap);
  }
})();
