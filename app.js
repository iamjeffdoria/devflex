// app.js
import { db } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const WAITLIST_COLLECTION = "waitlist";
const BASE_COUNT = 253;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function submitToWaitlist(email) {
  await addDoc(collection(db, WAITLIST_COLLECTION), {
    email: email.trim().toLowerCase(),
    createdAt: serverTimestamp(),
    source: "landing-page"
  });
}

function wireUpForm(formId, inputId, buttonId, noteId) {
  const form   = document.getElementById(formId);
  const input  = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  const note   = document.getElementById(noteId);
  if (!form || !input || !button || !note) return;

  const defaultNoteText = note.textContent;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value;

    if (!isValidEmail(email)) {
      note.textContent = "That doesn't look like a valid email — double check it?";
      note.classList.add("is-error");
      note.classList.remove("is-success");
      return;
    }

    button.disabled = true;
    const labelEl = button.querySelector(".btn-label");
    const originalLabel = labelEl ? labelEl.textContent : "Join waitlist";
    if (labelEl) labelEl.textContent = "Joining...";
    note.classList.remove("is-error");

    try {
      await submitToWaitlist(email);
      note.textContent = "You're on the list. We'll email you when DevFlex is ready.";
      note.classList.add("is-success");
      form.reset();
      bumpCountDisplay();
    } catch (err) {
      console.error("Waitlist submission failed:", err);
      note.textContent = "Something went wrong — mind trying again in a moment?";
      note.classList.add("is-error");
      note.classList.remove("is-success");
    } finally {
      button.disabled = false;
      if (labelEl) labelEl.textContent = originalLabel;
    }
  });

  input.addEventListener("input", () => {
    if (note.classList.contains("is-error") || note.classList.contains("is-success")) {
      note.textContent = defaultNoteText;
      note.classList.remove("is-error", "is-success");
    }
  });
}

function bumpCountDisplay() {
  const el = document.getElementById("waitlist-count");
  if (!el) return;
  const current = parseInt(el.textContent.replace(/,/g, ""), 10) || BASE_COUNT;
  el.textContent = (current + 1).toLocaleString();
}

wireUpForm("waitlist-form",       "email",       "submit-btn",       "form-note");
wireUpForm("waitlist-form-final", "email-final", "submit-btn-final", "form-note-final");

// Buy intent — logs to Firestore alongside their email
function wireUpBuyBtn(btnId, emailInputId, noteId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(emailInputId);
  const note  = document.getElementById(noteId);
  if (!btn || !input || !note) return;

  btn.addEventListener("click", async () => {
    const email = input.value.trim();

    if (!isValidEmail(email)) {
      note.textContent = "Enter your email above first so we know who's interested.";
      note.classList.add("is-error");
      note.classList.remove("is-success");
      input.focus();
      return;
    }

    btn.disabled = true;
    const labelEl = btn.querySelector(".btn-label");
    if (labelEl) labelEl.textContent = "Noted...";
    note.classList.remove("is-error");

    try {
      await addDoc(collection(db, "buy_intent"), {
        email: email.toLowerCase(),
        createdAt: serverTimestamp(),
        source: "landing-page"
      });
      note.textContent = "Noted — we'll reach out first when pricing is ready.";
      note.classList.add("is-success");
      note.classList.remove("is-error");
      if (labelEl) labelEl.textContent = "Noted ✓";
    } catch (err) {
      console.error("Buy intent failed:", err);
      note.textContent = "Something went wrong — try again in a moment.";
      note.classList.add("is-error");
      note.classList.remove("is-success");
      btn.disabled = false;
      if (labelEl) labelEl.textContent = "I'd pay for this";
    }
  });
}

wireUpBuyBtn("buy-btn",       "email",       "form-note");
wireUpBuyBtn("buy-btn-final", "email-final", "form-note-final");

// Render Lucide icons
setTimeout(() => {
  if (window.lucide) window.lucide.createIcons();
}, 0);

// Scroll-triggered reveal
function setupScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  const indexMap = new Map();
  targets.forEach((el, i) => indexMap.set(el, i));

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = indexMap.get(entry.target) ?? 0;
          const delay = (i % 8) * 60;
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

setupScrollReveal();

// Phone mockup tab switching
function setupPhoneTabs() {
  const buttons = document.querySelectorAll(".app-bottom-nav__item");
  const screens = document.querySelectorAll(".app-screen");
  const badge   = document.getElementById("app-screen-badge");
  if (!buttons.length || !screens.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      screens.forEach((s) => {
        s.classList.toggle("is-active", s.dataset.screen === target);
      });

      if (badge) {
        if (target === "profile") {
          badge.className = "app-badge app-badge--github";
          badge.innerHTML = '<i data-lucide="git-branch"></i> github connected';
        } else {
          badge.className = "app-badge app-badge--open";
          badge.innerHTML = '<i data-lucide="unlock"></i> docs allowed';
        }
        if (window.lucide) window.lucide.createIcons({ nodes: [badge] });
      }
    });
  });
}

setupPhoneTabs();

// Navbar mobile menu toggle
function setupMobileNav() {
  const burger = document.getElementById("nav-burger");
  const menu   = document.getElementById("mobile-menu");
  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", isOpen);
    menu.setAttribute("aria-hidden", !isOpen);
  });

  // Close menu when a link is clicked
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
    });
  });
}

setupMobileNav();