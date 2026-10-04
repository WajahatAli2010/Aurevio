import { $ } from "./dom.js";

export function initInquiryForm() {
  const form = $("#inquiry-form");
  const status = $("#inquiry-status");
  if (!form || !status) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const data = new FormData(form);
    const brief = [
      "AUREVIO PROJECT INQUIRY","",
      "Name: " + data.get("name"),
      "Business / project: " + data.get("business"),
      "Contact: " + data.get("contact"),
      "Service: " + data.get("service"),"",
      "Brief:",data.get("brief")
    ].join("
");

    try {
      await navigator.clipboard.writeText(brief);
      status.textContent = "Inquiry copied. Paste it into the Aurevio Instagram DM to send it.";
    } catch {
      status.textContent = "Inquiry prepared. Copy the details and send them through the Aurevio Instagram DM.";
    }
    window.open("https://instagram.com/mrpapypants", "_blank", "noopener,noreferrer");
  });
}
