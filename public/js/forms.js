document.addEventListener("click", (e) => {
    const btn = e.target.closest(".pw-toggle");
    if (!btn) return;

    const inputID = btn.getAttribute("aria-controls");
    const input = document.getElementById(inputID);
    if (!input) return;

    const showing = input.type === "text";
    input.type = showing ? "password" : "text";

    btn.setAttribute("aria-pressed", String(!showing));
    btn.textContent = showing ? "Show" : "Hide";
    btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("add-classification-form");
  const input = document.getElementById("classification_name");
  if (!form || !input) return; // <-- check to make sure it only runs on the right page

  const msg = "Use letters and numbers only (no spaces or special characters).";

  input.addEventListener("invalid", () => { // <-- custom message
    if (input.validity.valueMissing || input.validity.patternMismatch) {
      input.setCustomValidity(msg);
    }
  });

  input.addEventListener("input", () => { // <-- reset message when user types
    input.setCustomValidity("");
  });

  input.addEventListener("keydown", (e) => { // <-- prevent spaces
    if (e.key === " ") e.preventDefault();
  });

  form.addEventListener("submit", () => { // <-- trim whitespace
    input.value = input.value.trim();
  });
});

// adding to inventory
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-inventory-form");
  if (!form) return; // only run on the add-inventory page

  const q = (id) => document.getElementById(id);

  const requiredFields = [
    "classification_id",
    "inv_make",
    "inv_model",
    "inv_year",
    "inv_price",
    "inv_miles",
    "inv_color",
    "inv_image",
    "inv_thumbnail",
    "inv_description",
  ];

  // Trim text-like inputs on submit
  form.addEventListener("submit", () => {
    requiredFields.forEach((id) => {
      const el = q(id);
      if (el && typeof el.value === "string") el.value = el.value.trim();
    });
  });

  const setMsg = (el, msg) => { el.setCustomValidity(msg); el.reportValidity(); };
  const clearMsg = (el) => el.setCustomValidity("");

  const yearEl  = q("inv_year");
  const priceEl = q("inv_price");
  const milesEl = q("inv_miles");

  // --- helpers to tighten number fields ---
  const blockChars = (el, { allowDot = false } = {}) => {
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      const banned = ["e", "E", "+", "-"];
      if (banned.includes(e.key)) e.preventDefault();
      if (!allowDot && e.key === ".") e.preventDefault();
    });
  };

  // strip non-digits as user types
  const digitsOnly = (el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      const cleaned = el.value.replace(/[^\d]/g, "");
      if (el.value !== cleaned) el.value = cleaned;
      el.setCustomValidity("");
    });
  };

  // Apply to the number fields
  blockChars(yearEl);
  blockChars(milesEl);
  blockChars(priceEl, { allowDot: true }); // price can have a dot

  digitsOnly(yearEl);
  digitsOnly(milesEl);

  // Friendly validity messages on submit/invalid
  if (yearEl) {
    yearEl.addEventListener("invalid", () => {
      if (yearEl.validity.rangeUnderflow || yearEl.validity.rangeOverflow || yearEl.validity.badInput) {
        setMsg(yearEl, "Enter a year between 1900 and 2100.");
      }
    });
    yearEl.addEventListener("input", () => clearMsg(yearEl));
  }

  if (priceEl) {
    priceEl.addEventListener("invalid", () => {
      if (priceEl.validity.rangeUnderflow || priceEl.validity.stepMismatch || priceEl.validity.badInput) {
        setMsg(priceEl, "Enter a positive price (cents allowed).");
      }
    });
    priceEl.addEventListener("input", () => clearMsg(priceEl));
  }

  if (milesEl) {
    milesEl.addEventListener("invalid", () => {
      if (milesEl.validity.rangeUnderflow || milesEl.validity.stepMismatch || milesEl.validity.badInput) {
        setMsg(milesEl, "Enter a non-negative whole number.");
      }
    });
    milesEl.addEventListener("input", () => clearMsg(milesEl));
  }
});
