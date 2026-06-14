// Console Cheat Commands reference page
// ------------------------------------

const CONSOLE_COMMANDS_SOURCE = "Ref/COMMANDS.md";
const CONSOLE_COMMANDS_MOD_URL = "https://www.nexusmods.com/vtmbloodlines2/mods/176?published=1";

let _consoleCommandsLoaded = false;
let _consoleCommandsPromise = null;

function getEmbeddedConsoleCommandsMarkdown() {
  if (typeof window !== "undefined" && typeof window.CONSOLE_COMMANDS_MARKDOWN === "string") {
    return window.CONSOLE_COMMANDS_MARKDOWN;
  }
  if (typeof CONSOLE_COMMANDS_MARKDOWN === "string") {
    return CONSOLE_COMMANDS_MARKDOWN;
  }
  return "";
}

function escapeCommandsHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCommandsInline(value) {
  let html = escapeCommandsHtml(value).replace(/\\\|/g, "|");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return html;
}

function splitCommandsTableRow(row) {
  const text = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let current = "";
  let escaped = false;
  let inCode = false;

  for (const char of text) {
    if (char === "`" && !escaped) {
      inCode = !inCode;
      current += char;
      escaped = false;
      continue;
    }
    if (char === "|" && !escaped && !inCode) {
      cells.push(current.trim());
      current = "";
      escaped = false;
      continue;
    }
    current += char;
    escaped = char === "\\" && !escaped;
    if (char !== "\\") escaped = false;
  }
  cells.push(current.trim());
  return cells;
}

function isCommandsTableSeparator(line) {
  const cells = splitCommandsTableRow(line);
  return cells.length > 1 && cells.every(cell => /^:?-{3,}:?$/.test(cell.trim()));
}

function isCommandsTableStart(lines, index) {
  const line = lines[index] || "";
  const next = lines[index + 1] || "";
  return line.includes("|") && isCommandsTableSeparator(next);
}

function slugCommandsHeading(text, used) {
  const base = text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  used.add(slug);
  return slug;
}

function renderCommandsMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  const usedHeadings = new Set();
  let sectionOpen = false;
  let listType = null;
  let inCode = false;
  let codeBuffer = [];

  function closeList() {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  }

  function closeSection() {
    closeList();
    if (sectionOpen) html.push("</section>");
    sectionOpen = false;
  }

  function ensureList(type) {
    if (listType === type) return;
    closeList();
    listType = type;
    html.push(`<${type}>`);
  }

  function renderTable(startIndex) {
    const header = splitCommandsTableRow(lines[startIndex]);
    const rows = [];
    let i = startIndex + 2;
    while (i < lines.length && lines[i].trim().includes("|")) {
      rows.push(splitCommandsTableRow(lines[i]));
      i += 1;
    }

    let table = `<div class="console-commands-table-wrap"><table class="console-commands-table"><thead><tr>`;
    table += header.map(cell => `<th>${renderCommandsInline(cell)}</th>`).join("");
    table += "</tr></thead><tbody>";
    for (const row of rows) {
      table += `<tr>${header.map((_, idx) => `<td>${renderCommandsInline(row[idx] || "")}</td>`).join("")}</tr>`;
    }
    table += "</tbody></table></div>";
    html.push(table);
    return i;
  }

  for (let i = 0; i < lines.length;) {
    const raw = lines[i];
    const line = raw.trim();

    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre class="console-commands-code"><code>${escapeCommandsHtml(codeBuffer.join("\n"))}</code></pre>`);
        codeBuffer = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      i += 1;
      continue;
    }

    if (inCode) {
      codeBuffer.push(raw);
      i += 1;
      continue;
    }

    if (!line) {
      closeList();
      i += 1;
      continue;
    }

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      if (level === 1) {
        i += 1;
        continue;
      }
      const id = slugCommandsHeading(text, usedHeadings);
      closeList();
      if (level === 2) {
        closeSection();
        sectionOpen = true;
        toc.push({ id, text });
        html.push(`<section class="console-command-section" data-command-section><h2 id="${id}">${renderCommandsInline(text)}</h2>`);
      } else {
        html.push(`<h${level} id="${id}">${renderCommandsInline(text)}</h${level}>`);
      }
      i += 1;
      continue;
    }

    if (isCommandsTableStart(lines, i)) {
      closeList();
      i = renderTable(i);
      continue;
    }

    const orderedMatch = /^\d+\.\s+(.+)$/.exec(line);
    if (orderedMatch) {
      ensureList("ol");
      html.push(`<li>${renderCommandsInline(orderedMatch[1])}</li>`);
      i += 1;
      continue;
    }

    const bulletMatch = /^[-*]\s+(.+)$/.exec(line);
    if (bulletMatch) {
      ensureList("ul");
      html.push(`<li>${renderCommandsInline(bulletMatch[1])}</li>`);
      i += 1;
      continue;
    }

    closeList();
    html.push(`<p>${renderCommandsInline(line)}</p>`);
    i += 1;
  }

  if (inCode) {
    html.push(`<pre class="console-commands-code"><code>${escapeCommandsHtml(codeBuffer.join("\n"))}</code></pre>`);
  }
  closeSection();

  return {
    body: html.join(""),
    toc: toc.map(item => `<a href="#${item.id}">${renderCommandsInline(item.text)}</a>`).join(""),
  };
}

function bindConsoleCommandsPage(root) {
  const search = root.querySelector("#console-commands-search");
  const count = root.querySelector("#console-commands-count");
  const sections = Array.from(root.querySelectorAll("[data-command-section]"));
  const openMods = root.querySelector("[data-open-mods]");

  if (openMods) {
    openMods.addEventListener("click", () => {
      const modal = document.getElementById("mods-modal");
      if (modal) modal.classList.remove("hidden");
    });
  }

  if (!search) return;
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    sections.forEach(section => {
      const match = !query || section.textContent.toLowerCase().includes(query);
      section.hidden = !match;
      if (match) visible += 1;
    });
    if (count) {
      count.textContent = query ? `${visible} sections` : `${sections.length} sections`;
    }
  });
}

function renderConsoleCommandsShell(root, statusText = "Loading command reference...") {
  root.innerHTML = `
    <section class="console-commands-page">
      <header class="console-commands-hero">
        <div>
          <p class="console-commands-kicker">Mod Reference</p>
          <h1>Console Cheat Commands</h1>
          <p class="console-commands-summary">A browsable reference for the <code>ccc</code> UE4SS console command set.</p>
        </div>
        <div class="console-commands-actions">
          <a class="console-commands-action" href="${CONSOLE_COMMANDS_MOD_URL}" target="_blank" rel="noopener">Nexus Mods</a>
          <a class="console-commands-action" href="${CONSOLE_COMMANDS_SOURCE}" target="_blank" rel="noopener">Raw Markdown</a>
          <button class="console-commands-action" type="button" data-open-mods>Mods</button>
        </div>
      </header>
      <div class="console-commands-toolbar">
        <label class="console-commands-search">
          <span>Search</span>
          <input id="console-commands-search" type="search" placeholder="spawn weapon, resonance, noclip..." autocomplete="off">
        </label>
        <span class="console-commands-count" id="console-commands-count">${statusText}</span>
      </div>
      <div class="console-commands-toc" id="console-commands-toc"></div>
      <div class="console-commands-body" id="console-commands-body">
        <div class="empty-state">${statusText}</div>
      </div>
    </section>
  `;
}

function applyConsoleCommandsMarkdown(root, markdown) {
  const body = root.querySelector("#console-commands-body");
  const toc = root.querySelector("#console-commands-toc");
  const count = root.querySelector("#console-commands-count");
  const rendered = renderCommandsMarkdown(markdown);
  if (toc) toc.innerHTML = rendered.toc;
  if (body) body.innerHTML = rendered.body;
  const sections = root.querySelectorAll("[data-command-section]").length;
  if (count) count.textContent = `${sections} sections`;
  _consoleCommandsLoaded = true;
  bindConsoleCommandsPage(root);
}

function renderConsoleCommandsPage() {
  const root = document.getElementById("subpage-console");
  if (!root) return;

  if (_consoleCommandsLoaded) {
    bindConsoleCommandsPage(root);
    return;
  }

  renderConsoleCommandsShell(root);
  const embeddedMarkdown = getEmbeddedConsoleCommandsMarkdown();
  if (embeddedMarkdown) {
    applyConsoleCommandsMarkdown(root, embeddedMarkdown);
    return Promise.resolve();
  }

  const body = root.querySelector("#console-commands-body");
  const toc = root.querySelector("#console-commands-toc");
  const count = root.querySelector("#console-commands-count");

  _consoleCommandsPromise = _consoleCommandsPromise || fetch(CONSOLE_COMMANDS_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(markdown => {
      applyConsoleCommandsMarkdown(root, markdown);
    })
    .catch(() => {
      if (body) {
        body.innerHTML = `
          <div class="console-commands-fallback">
            <p>Could not fetch the Markdown reference in this browser context. The raw file is embedded below.</p>
            <iframe title="Console Cheat Commands raw Markdown" src="${CONSOLE_COMMANDS_SOURCE}"></iframe>
          </div>
        `;
      }
      if (count) count.textContent = "Raw fallback";
      bindConsoleCommandsPage(root);
    });

  return _consoleCommandsPromise;
}
