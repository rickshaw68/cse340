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