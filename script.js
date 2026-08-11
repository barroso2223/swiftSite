/* Swift Signing Florida — shared site behavior
   No external dependencies. Respects prefers-reduced-motion. */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Mobile menu ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when a nav link is chosen
    header.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQ accordions ---------- */
  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var answer = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (answer) answer.setAttribute("data-open", expanded ? "false" : "true");
    });
  });

  /* ---------- Scroll reveal (skips entirely if reduced motion) ---------- */
  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (!prefersReduced && "IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- State gate for the online application CTA ----------
     Ethos's self-service application is not currently available to
     New York residents. This widget requires a state selection before
     activating the button: non-NY states link out to the Ethos
     application in a new tab; New York routes to the contact form so
     Contact me and I can help directly. */
  document
    .querySelectorAll("[data-state-gate-select]")
    .forEach(function (select) {
      var gateId = select.getAttribute("data-state-gate-select");
      var cta = document.querySelector(
        '[data-state-gate-cta="' + gateId + '"]',
      );
      var note = document.querySelector(
        '[data-state-gate-note="' + gateId + '"]',
      );
      if (!cta) return;

      var defaultHref = cta.getAttribute("data-default-href");
      var defaultText = cta.getAttribute("data-default-text");
      var nyHref = cta.getAttribute("data-ny-href");
      var nyText = cta.getAttribute("data-ny-text");

      function lockCta() {
        cta.classList.add("is-locked");
        cta.setAttribute("aria-disabled", "true");
      }

      function applyState(value) {
        if (!value) {
          lockCta();
          return;
        }
        cta.classList.remove("is-locked");
        cta.setAttribute("aria-disabled", "false");
        if (value === "NY") {
          cta.setAttribute("href", nyHref);
          cta.removeAttribute("target");
          cta.removeAttribute("rel");
          cta.innerHTML = nyText;
          if (note) note.setAttribute("data-active", "ny");
        } else {
          cta.setAttribute("href", defaultHref);
          cta.setAttribute("target", "_blank");
          cta.setAttribute("rel", "noopener noreferrer");
          cta.innerHTML =
            defaultText +
            ' <span class="external-indicator" aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span>';
          if (note) note.setAttribute("data-active", "other");
        }
      }

      lockCta();
      select.addEventListener("change", function () {
        applyState(select.value);
      });
      cta.addEventListener("click", function (e) {
        if (cta.classList.contains("is-locked")) {
          e.preventDefault();
          select.focus();
        }
      });
    });

  /* ---------- Netlify contact / lead forms ---------- */
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      var status = form.querySelector(".form-status");
      var submitButton = form.querySelector('button[type="submit"]');

      if (!form.checkValidity()) {
        form.reportValidity();

        if (status) {
          status.textContent = "Please fill in all required fields.";
          status.setAttribute("data-state", "error");
        }

        return;
      }

      if (status) {
        status.textContent = "Sending your request...";
        status.setAttribute("data-state", "pending");
      }

      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        var formData = new FormData(form);

        var response = await fetch("/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(formData).toString(),
        });

        if (!response.ok) {
          throw new Error("Form submission failed.");
        }

        if (status) {
          status.textContent =
            "Thank you. Your request has been received and Daniel will be in touch soon.";
          status.setAttribute("data-state", "success");
        }

        form.reset();
      } catch (error) {
        console.error("Netlify form submission error:", error);

        if (status) {
          status.textContent =
            "Your request could not be sent. Please call (786) 873-9593 or email swiftsigningfl@gmail.com.";
          status.setAttribute("data-state", "error");
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  });

  /* ---------- Current-year footer stamp ---------- */
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* =========================================================
   ETHOS OUTBOUND CLICK TRACKING
   ========================================================= */

  document.querySelectorAll(".ethos-link").forEach(function (link) {
    link.addEventListener("click", function () {
      var location = link.dataset.ethosLocation || "unknown";
      var pagePath = window.location.pathname;

      if (typeof gtag === "function") {
        gtag("event", "ethos_quote_click", {
          link_url: link.href,
          link_location: location,
          page_path: pagePath,
          page_title: document.title,
        });
      }
    });
  });
});
