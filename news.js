// ===== NEWS =====
// To add news, put a new entry in this list (order doesn't matter, newest shows first).
//   date:  "YYYY-MM-DD"
//   event: true  -> shows a countdown badge and an "Add to calendar" link until the day passes
//   start: optional exact start time with its UTC offset, e.g. "2026-12-03T13:00:00-08:00" (1 PM PST).
//          Without it the calendar entry is an all-day event.
//   hours: optional length for the calendar entry (default 1)
const NEWS = [
  {
    date: "2026-12-03",
    title: "Student Showcase",
    text: "The five students from our comic literacy course at Cardinal Academy will present the stories and comics they made with MOSAIC. Everyone is welcome.",
    where: "Stanford University · 1:00 PM PST",
    start: "2026-12-03T13:00:00-08:00",
    event: true
  }
];

(function () {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const fmt = d => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function icsLink(n) {
    const d = n.date.replace(/-/g, "");
    let when;
    if (n.start) {
      const utc = t => t.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
      const s = new Date(n.start), e = new Date(s.getTime() + (n.hours || 1) * 3600000);
      when = ["DTSTART:" + utc(s), "DTEND:" + utc(e)];
    } else {
      const next = new Date(n.date + "T00:00:00"); next.setDate(next.getDate() + 1);
      const d2 = [next.getFullYear(), String(next.getMonth() + 1).padStart(2, "0"), String(next.getDate()).padStart(2, "0")].join("");
      when = ["DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + d2];
    }
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MOSAIC//EN", "BEGIN:VEVENT",
      "UID:" + d + "-" + n.title.replace(/\W+/g, "") + "@mosaic",
      ...when,
      n.where ? "LOCATION:" + n.where.split(" · ")[0].replace(/[,;]/g, "\\$&") : "",
      "SUMMARY:MOSAIC " + n.title, "DESCRIPTION:" + n.text.replace(/[,;]/g, "\\$&"),
      "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  }

  // Opens Google Calendar with the event filled in; the visitor just clicks Save.
  function googleLink(n) {
    let dates;
    if (n.start) {
      const utc = t => t.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
      const st = new Date(n.start), en = new Date(st.getTime() + (n.hours || 1) * 3600000);
      dates = utc(st) + "/" + utc(en);
    } else {
      const next = new Date(n.date + "T00:00:00"); next.setDate(next.getDate() + 1);
      dates = n.date.replace(/-/g, "") + "/" + [next.getFullYear(), String(next.getMonth() + 1).padStart(2, "0"), String(next.getDate()).padStart(2, "0")].join("");
    }
    const q = new URLSearchParams({ action: "TEMPLATE", text: "MOSAIC " + n.title, dates, details: n.text });
    if (n.where) q.set("location", n.where.split(" · ")[0]);
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }

  function render(n) {
    const d = new Date(n.date + "T00:00:00");
    const days = Math.round((d - today) / 86400000);
    const upcoming = n.event && days >= 0;
    let badge = "";
    if (n.event) {
      badge = days > 1 ? `<span class="badge soon">In ${days} days</span>`
            : days === 1 ? `<span class="badge soon">Tomorrow</span>`
            : days === 0 ? `<span class="badge soon">Today</span>`
            : `<span class="badge">Past event</span>`;
    }
    let meta = n.where ? esc(n.where) : "";
    if (upcoming) meta += (meta ? " · " : "") +
      `<a href="${esc(googleLink(n))}" target="_blank" rel="noopener">Add to Google Calendar</a> · ` +
      `<a href="${icsLink(n)}" download="mosaic-${n.date}.ics">Apple / Outlook (.ics)</a>`;
    return `<article class="news ${upcoming ? "upcoming" : ""}">
        <div class="news-date">${fmt(d)}${badge}</div>
        <h3>${esc(n.title)}</h3>
        <p class="text">${esc(n.text)}</p>
        ${meta ? `<p class="meta">${meta}</p>` : ""}
      </article>`;
  }

  const sorted = NEWS.slice().sort((a, b) => b.date.localeCompare(a.date));
  document.querySelectorAll("[data-news]").forEach(el => {
    const limit = parseInt(el.getAttribute("data-news"), 10) || sorted.length;
    el.innerHTML = sorted.slice(0, limit).map(render).join("") || "<p class='muted'>No news yet.</p>";
  });
})();
