// ===== NEWS =====
// To add news, put a new entry in this list (order doesn't matter, newest shows first).
//   date:  "YYYY-MM-DD"
//   event: true  -> shows a countdown badge and an "Add to calendar" link until the day passes
const NEWS = [
  {
    date: "2026-12-03",
    title: "Student Showcase",
    text: "The five students from our comic literacy course at Cardinal Academy will present the stories and comics they made with MOSAIC. Everyone is welcome.",
    where: "Time and location to be announced",
    event: true
  }
];

(function () {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const fmt = d => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function icsLink(n) {
    const d = n.date.replace(/-/g, "");
    const next = new Date(n.date + "T00:00:00"); next.setDate(next.getDate() + 1);
    const d2 = [next.getFullYear(), String(next.getMonth() + 1).padStart(2, "0"), String(next.getDate()).padStart(2, "0")].join("");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MOSAIC//EN", "BEGIN:VEVENT",
      "UID:" + d + "-" + n.title.replace(/\W+/g, "") + "@mosaic",
      "DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + d2,
      "SUMMARY:MOSAIC " + n.title, "DESCRIPTION:" + n.text.replace(/[,;]/g, "\\$&"),
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
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
    if (upcoming) meta += (meta ? " · " : "") + `<a href="${icsLink(n)}" download="mosaic-${n.date}.ics">Add to calendar</a>`;
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
