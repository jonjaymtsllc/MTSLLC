/* Moore Tutoring Solutions — shared site behavior */
(function () {
  "use strict";

  /* ----- Mobile navigation toggle ----- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav__menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu with the Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ----- Scroll reveal (skipped when the visitor prefers reduced motion) -----
     .reveal elements fade up into place; .mark phrases get their highlighter
     sweep. Siblings inside a grid reveal one after another (staggered). */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal, .mark");
  var STAGGER_PARENTS = ["card-grid", "tiers", "stats", "check-rows", "faq-list"];

  function revealDelay(el) {
    var parent = el.parentElement;
    if (!parent) return 0;
    var staggered = STAGGER_PARENTS.some(function (cls) {
      return parent.classList.contains(cls);
    });
    if (!staggered) return 0;
    var index = 0;
    for (var i = 0; i < parent.children.length; i++) {
      if (parent.children[i] === el) break;
      if (parent.children[i].classList.contains("reveal")) index++;
    }
    return Math.min(index * 90, 450);
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            observer.unobserve(el);
            var delay = revealDelay(el);
            if (delay > 0) {
              window.setTimeout(function () {
                el.classList.add("is-visible");
              }, delay);
            } else {
              el.classList.add("is-visible");
            }
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ----- Count-up numbers -----
     Every headline number on the site counts up from zero when it scrolls
     into view, then lands exactly on the text that's written in the HTML.

     TO MAKE A NUMBER COUNT UP: add  data-countup  to the element holding it.
     That's the whole job — nothing here needs changing.

     It handles anything you write: "29", "+6", "$2,749", "ACT 22 → 28",
     "89% vs 71%". Words, symbols, and spacing stay exactly where they are and
     only the digits move, so every number in the text counts at once. Text
     with no digits in it ("A−", "from C+") is simply left alone. */

  /* 1234567.5 -> "1,234,567.5" (commas in the whole-number part only) */
  function groupDigits(str) {
    var parts = str.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  /* Split "ACT 22 → 28" into ["ACT ", {number}, " → ", {number}] so the
     words stay put while the numbers animate. Returns null if there is
     nothing to count. */
  function parseCountUp(text) {
    var pattern = /\d[\d,]*(?:\.\d+)?/g;
    var pieces = [];
    var cursor = 0;
    var match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > cursor) pieces.push(text.slice(cursor, match.index));
      var raw = match[0];
      var plain = raw.replace(/,/g, "");
      pieces.push({
        raw: raw,
        value: parseFloat(plain),
        decimals: (plain.split(".")[1] || "").length,
        commas: raw.indexOf(",") !== -1
      });
      cursor = match.index + raw.length;
    }

    if (!pieces.length) return null;
    if (cursor < text.length) pieces.push(text.slice(cursor));
    return pieces;
  }

  function renderCountUp(pieces, progress) {
    var out = "";
    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      if (typeof piece === "string") {
        out += piece;
      } else if (progress >= 1) {
        out += piece.raw;
      } else {
        var shown = (piece.value * progress).toFixed(piece.decimals);
        out += piece.commas ? groupDigits(shown) : shown;
      }
    }
    return out;
  }

  function countUp(el) {
    var original = el.textContent;
    var pieces = parseCountUp(original);
    if (!pieces) return;

    /* Hold the box at its finished size so the words around it don't shuffle
       while the digits are still growing. A plain inline element ignores
       min-width, so it's switched to inline-block just for the animation —
       which is why inline count-ups should wrap the number and nothing else. */
    var inline = window.getComputedStyle(el).display === "inline";
    if (inline) el.style.display = "inline-block";
    var width = el.getBoundingClientRect().width;
    if (width) el.style.minWidth = width + "px";

    var duration = 1100;
    var startTime = null;

    function tick(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      if (progress < 1) {
        el.textContent = renderCountUp(pieces, eased);
        window.requestAnimationFrame(tick);
      } else {
        el.textContent = original; // land exactly on the real text
        el.style.minWidth = "";
        if (inline) el.style.display = "";
      }
    }
    window.requestAnimationFrame(tick);
  }

  /* The visual editor saves whatever is on the page at that moment, so the
     animation stays off while editing — otherwise a half-counted number
     ("$1,203") could get written into the .html file. */
  var editing =
    new URLSearchParams(window.location.search).has("edit") ||
    window.location.hash === "#edit";

  var countEls = document.querySelectorAll("[data-countup], .stat__num");
  if (!reduceMotion && !editing && "IntersectionObserver" in window && countEls.length) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countObserver.unobserve(entry.target);
            countUp(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    countEls.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  /* ----- Calendly booking buttons -----
     Every "Book a Consultation" button is a normal link straight to the
     Calendly page, so it still works if scripts are blocked or slow. Once
     Calendly's widget script has loaded, we open the scheduler in a popup
     over the site instead of sending the visitor away.

     To point the buttons at a different Calendly event, find-and-replace the
     Calendly address inside the .html files — nothing here needs to change. */
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;
    var link = e.target.closest("[data-calendly]");
    if (!link || !window.Calendly) return;
    // Let the browser handle ctrl/cmd/shift-click (open in a new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.Calendly.initPopupWidget({ url: link.href });
  });

  /* ----- Email forms: "Have us call you" (book.html) and the contact form
     (contact.html) -----
     Both submit through formsubmit.co, which forwards every message straight
     to jonjay@mooretutoringsolutions.com — no server needed, works on any
     host including Vercel.
     ONE-TIME SETUP PER FORM: submit each form once yourself, then click the
     "Activate" link in the email FormSubmit sends you. After that it's
     automatic. Until a form is activated, its messages are NOT delivered.
     If JavaScript is off, the form still posts to FormSubmit's own page. */
  var emailForms = document.querySelectorAll("form[data-mts-email]");

  emailForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var label = button ? button.textContent : "";
      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }

      var success = form.parentElement.querySelector(".form-success");
      var error = form.parentElement.querySelector(".form-error");
      if (success) success.classList.remove("is-visible");
      if (error) error.classList.remove("is-visible");

      var finish = function (ok) {
        if (button) {
          button.disabled = false;
          button.textContent = label;
        }
        var box = ok ? success : error;
        if (box) {
          box.classList.add("is-visible");
          box.setAttribute("tabindex", "-1");
          box.focus();
        }
        if (ok) form.reset();
      };

      fetch("https://formsubmit.co/ajax/jonjay@mooretutoringsolutions.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function () { finish(true); })
        .catch(function () { finish(false); });
    });
  });

  /* ----- Package payment buttons (programs.html) -----
     Each "Purchase This Package" button stays inert until a real Stripe
     Payment Link is pasted in place of its href="#" (see README.md). */
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;
    var pay = e.target.closest("[data-stripe-payment]");
    if (pay && pay.getAttribute("href") === "#") {
      e.preventDefault();
      window.alert("Online payment is being set up — book a free consultation and we'll get your student started.");
    }
  });

  /* ----- Footer year ----- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
