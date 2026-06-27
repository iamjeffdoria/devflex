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