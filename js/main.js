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
  var STAGGER_PARENTS = ["card-grid", "tiers", "stats", "check-rows"];

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

  /* ----- Count-up stat numbers (results page) -----
     Big stats like "+4.2" and "92%" count up from zero when they scroll
     into view, then land exactly on the original text. */
  function countUp(el) {
    var original = el.textContent;
    var parts = original.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
    if (!parts) return;
    var prefix = parts[1];
    var target = parseFloat(parts[2].replace(/,/g, ""));
    var suffix = parts[3];
    var decimals = (parts[2].split(".")[1] || "").length;
    var duration = 1100;
    var startTime = null;

    function tick(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        el.textContent = original;
      }
    }
    window.requestAnimationFrame(tick);
  }

  var statNums = document.querySelectorAll(".stat__num");
  if (!reduceMotion && "IntersectionObserver" in window && statNums.length) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            statObserver.unobserve(entry.target);
            countUp(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach(function (el) {
      statObserver.observe(el);
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

  /* ----- "Have us call you" form (book.html) -----
     Submits through formsubmit.co, which forwards every request straight to
     jonjay@mooretutoringsolutions.com — no server needed, works on any host.
     ONE-TIME SETUP: submit the form once yourself, then click the "Activate"
     link in the email FormSubmit sends you. After that it's automatic.
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

  /* ----- Forms -----
     The contact form is marked up for Netlify Forms (data-netlify="true"), so
     if you deploy on Netlify it collects submissions automatically — check the
     "Forms" tab in your Netlify dashboard.

     If you deploy on Vercel (or anywhere else), the easiest path is Formspree:
       1. Create a free form at https://formspree.io
       2. Copy your endpoint (looks like https://formspree.io/f/abcdwxyz)
       3. In contact.html, replace action="#" with that URL
          and delete the data-netlify attribute.
     Until a real endpoint exists, submitting shows a friendly on-page
     confirmation so the site never looks broken. */
  var forms = document.querySelectorAll("form[data-mts-form]");

  forms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "#";
      var isWired = action !== "#" && action !== "";
      var onNetlify = /\.netlify\.app$|netlify/.test(window.location.hostname);

      // If a real endpoint (or Netlify hosting) is set up, let it submit normally.
      if (isWired || onNetlify) return;

      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var success = form.parentElement.querySelector(".form-success");
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
      form.reset();
    });
  });

  /* ----- Footer year ----- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
