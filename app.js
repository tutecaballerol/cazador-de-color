/* ============================================================
   CAZA EL COLOR — lógica
   - Un color por semana (queda guardado en el celu con localStorage)
   - 4 consignas al azar de un pool de 16 + 4 libres = 8 fotos
   - Genera la guía 1080×1920 en canvas
   - En celu: Web Share (guardar en Fotos / mandar a IG). Fallback: descarga.
   ============================================================ */
(function () {
  "use strict";

  // --- Paleta: colores nombrables y cazables en la calle ---
  const PALETTE = [
    { name: "Magenta", hex: "#D6006E" }, { name: "Mostaza", hex: "#E1A100" },
    { name: "Teal", hex: "#008C8C" }, { name: "Coral", hex: "#FF6F5E" },
    { name: "Naranja", hex: "#C1440E" }, { name: "Amarillo", hex: "#FFD400" },
    { name: "Rojo", hex: "#D7263D" }, { name: "Rosa", hex: "#FF5FA2" },
    { name: "Violeta", hex: "#6A2C91" }, { name: "Lima", hex: "#9BC400" },
    { name: "Azul Klein", hex: "#1F2A8C" }, { name: "Celeste", hex: "#4FB3E8" },
    { name: "Turquesa", hex: "#1CC5B7" }, { name: "Ocre", hex: "#B87333" },
    { name: "Lavanda", hex: "#B57EDC" }
  ];

  // --- Pool de consignas (agnósticas al color: sirven con cualquiera) ---
  const CONSIGNAS = [
    { full: "Ocupando todo el cuadro", short: "TODO EL CUADRO" },
    { full: "Como fondo, no como sujeto", short: "COMO FONDO" },
    { full: "En movimiento", short: "EN MOVIMIENTO" },
    { full: "Macro, que no se entienda qué es", short: "MACRO" },
    { full: "Con una sombra dura cruzándolo", short: "SOMBRA DURA" },
    { full: "En un reflejo (vidrio, agua, espejo)", short: "REFLEJO" },
    { full: "En una textura", short: "TEXTURA" },
    { full: "En algo roto o gastado", short: "ROTO" },
    { full: "En algo transparente o translúcido", short: "TRANSPARENTE" },
    { full: "En algo hecho por humanos", short: "HECHO X HUMANOS" },
    { full: "Puesto ahí sin intención", short: "SIN INTENCION" },
    { full: "Autorretrato con el color encima", short: "AUTORRETRATO" },
    { full: "Alguien lo usa sin darse cuenta", short: "ALGUIEN LO USA" },
    { full: "Dos objetos distintos, mismo color", short: "DOS OBJETOS" },
    { full: "El ejemplar más feo de la familia", short: "EL MAS FEO" },
    { full: "El mismo color repetido, en patrón", short: "EN PATRON" }
  ];

  // --- Grilla mixta de la guía: 2 cuadradas grandes + 3 chicas + 3 verticales 4:5 ---
  const FW = 1080, FH = 1920, M = 56, G = 18;
  const inner = FW - 2 * M;
  const w2 = Math.round((inner - G) / 2);
  const w3 = Math.round((inner - 2 * G) / 3);
  const ph = Math.round(w3 * 1.25);
  const CELLS = [];
  let gy = 402;
  CELLS.push({ x: M, y: gy, w: w2, h: w2 });
  CELLS.push({ x: M + w2 + G, y: gy, w: w2, h: w2 });
  gy += w2 + G;
  for (let i = 0; i < 3; i++) CELLS.push({ x: M + i * (w3 + G), y: gy, w: w3, h: w3 });
  gy += w3 + G;
  for (let i = 0; i < 3; i++) CELLS.push({ x: M + i * (w3 + G), y: gy, w: w3, h: ph });

  // --- Helpers ---
  const $ = (id) => document.getElementById(id);
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
  function weekKey(d) { const t = new Date(d); t.setHours(0, 0, 0, 0); const day = (t.getDay() + 6) % 7; t.setDate(t.getDate() - day + 3); const y = t.getFullYear(); const jan1 = new Date(y, 0, 1); const wk = Math.ceil(((t - jan1) / 86400000 + 1) / 7); return y + "-W" + wk; }
  const wkNo = () => weekKey(new Date()).split("-W")[1];
  function nextSunday() { const t = new Date(); const day = t.getDay(); const add = (7 - day) % 7; t.setDate(t.getDate() + add); return t; }
  const fmt = (d) => d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  // --- Refs ---
  const swatch = $("swatch"), hint = $("hint"), hextag = $("hextag"), idx = $("idx");
  const result = $("result"), idxblock = $("idxblock"), guiderow = $("guiderow"), boardEl = $("board");
  const nameEl = $("name"), hexEl = $("hex"), clist = $("clist"), deadlineEl = $("deadline");
  const rollBtn = $("roll"), dlBtn = $("dl"), rerollBtn = $("reroll"), msg = $("msg");

  const deadline = nextSunday();
  $("week").textContent = "Sem " + wkNo() + " · " + new Date().getFullYear();
  let current = null, rolling = false;

  const show = (el) => el.classList.remove("hidden");

  function renderConsignas(cs) {
    clist.innerHTML = "";
    cs.forEach((c, i) => {
      const li = document.createElement("li");
      li.innerHTML = '<span class="n">0' + (i + 1) + '</span><span class="c">' + c.full + '</span>';
      clist.appendChild(li);
    });
  }

  function renderBoard(data) {
    boardEl.innerHTML = "";
    CELLS.forEach((c, i) => {
      const ci = data.cellMap[i], isC = ci != null;
      const d = document.createElement("div");
      d.className = "ph" + (isC ? " on" : "");
      d.style.left = (c.x / FW * 100) + "%"; d.style.top = (c.y / FH * 100) + "%";
      d.style.width = (c.w / FW * 100) + "%"; d.style.height = (c.h / FH * 100) + "%";
      const s = document.createElement("span");
      s.textContent = isC ? ("0" + (ci + 1) + " " + data.consignas[ci].short) : "LIBRE";
      if (!isC) s.style.color = "#a9a498";
      d.appendChild(s); boardEl.appendChild(d);
    });
  }

  function applyColor(c) {
    swatch.style.background = c.hex;
    hextag.textContent = c.hex.toUpperCase();
    nameEl.textContent = c.name.toUpperCase();
    hexEl.textContent = c.hex.toUpperCase() + " · familia, no el hex exacto";
    deadlineEl.textContent = fmt(deadline);
  }

  function reveal(data) {
    current = data;
    applyColor(data.color);
    renderConsignas(data.consignas);
    renderBoard(data);
    swatch.classList.remove("rolling"); swatch.classList.add("done");
    hint.style.display = "none";
    [result, idxblock, guiderow, dlBtn, rerollBtn].forEach(show);
    rollBtn.style.display = "none";
    localStorage.setItem("cazacolor:" + weekKey(new Date()), JSON.stringify(data));
  }

  function draw() {
    const consignas = shuffle(CONSIGNAS).slice(0, 4);
    const pos = shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 4);
    const cellMap = new Array(8).fill(null);
    pos.forEach((p, i) => (cellMap[p] = i));
    return { color: PALETTE[Math.floor(Math.random() * PALETTE.length)], consignas, cellMap };
  }

  function roll() {
    if (rolling) return;
    rolling = true; msg.textContent = "";
    rollBtn.disabled = true; rerollBtn.classList.add("hidden");
    hint.style.display = ""; hint.textContent = "";
    swatch.classList.remove("done"); swatch.classList.add("rolling");
    result.classList.add("hidden"); idxblock.classList.add("hidden");
    const finalData = draw();
    let ticks = 0; const total = 18;
    (function spin() {
      const j = Math.floor(Math.random() * PALETTE.length);
      swatch.style.background = PALETTE[j].hex;
      idx.textContent = String(j + 1).padStart(2, "0") + " / 15";
      ticks++;
      if (ticks < total) setTimeout(spin, 45 + ticks * ticks * 1.6); // desacelera
      else { swatch.classList.remove("rolling"); rolling = false; rollBtn.disabled = false; reveal(finalData); }
    })();
  }

  // --- Guía 1080×1920 en canvas ---
  function drawWrapped(x, text, px, py, maxW, lh) {
    const words = text.split(" ");
    let line = "", y = py;
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (x.measureText(t).width > maxW && line) { x.fillText(line, px, y); line = w; y += lh; }
      else line = t;
    }
    x.fillText(line, px, y);
    return y + lh;
  }
  async function buildGuide(data) {
    const color = data.color, cv = document.createElement("canvas");
    cv.width = FW; cv.height = FH;
    const x = cv.getContext("2d");
    const FF = "Archivo, Arial, sans-serif";
    const PAPER = "#F4F1EA", INK = "#0E0E0E", GRAY = "#DED9CE", GRAYON = "#CFC9BB", DIM = "#8a877e";
    x.fillStyle = PAPER; x.fillRect(0, 0, FW, FH);
    x.fillStyle = INK; x.font = "900 46px " + FF; x.fillText("CAZA EL COLOR", M, 96);
    x.font = "900 150px " + FF; x.textAlign = "right"; x.fillText(wkNo(), FW - M, 150); x.textAlign = "left";
    x.fillStyle = INK; x.fillRect(M, 180, FW - 2 * M, 3);
    x.fillStyle = color.hex; x.fillRect(M, 220, 74, 74);
    x.strokeStyle = INK; x.lineWidth = 2; x.strokeRect(M, 220, 74, 74);
    x.fillStyle = DIM; x.font = "600 22px " + FF; x.fillText("COLOR DE LA SEMANA · FAMILIA, NO EL HEX", M + 92, 246);
    x.fillStyle = INK; x.font = "900 66px " + FF; x.fillText(color.name.toUpperCase() + "  " + color.hex.toUpperCase(), M + 92, 300);
    x.fillRect(M, 352, FW - 2 * M, 3);
    CELLS.forEach((c, i) => {
      const ci = data.cellMap[i], isC = ci != null;
      x.fillStyle = isC ? GRAYON : GRAY; x.fillRect(c.x, c.y, c.w, c.h);
      x.fillStyle = INK; x.font = "700 22px " + FF;
      if (isC) {
        x.fillText("0" + (ci + 1), c.x + 16, c.y + 38);
        x.font = "700 20px " + FF;
        drawWrapped(x, data.consignas[ci].short, c.x + 16, c.y + 64, c.w - 32, 26);
      } else {
        x.fillStyle = "#a9a498"; x.fillText("LIBRE", c.x + 16, c.y + 38);
      }
    });
    x.fillStyle = INK; x.fillRect(M, FH - 150, FW - 2 * M, 3);
    x.font = "700 30px " + FF; x.fillText("8 FOTOS · HASTA EL " + fmt(deadline).toUpperCase(), M, FH - 96);
    x.font = "600 24px " + FF; x.fillStyle = DIM; x.fillText("@MATICABALLERO_", M, FH - 58);
    x.textAlign = "right"; x.fillText("#CAZACOLOR", FW - M, FH - 58); x.textAlign = "left";
    return cv;
  }

  // --- Exportar: en celu abre "compartir" (Fotos / IG). Fallback: descarga ---
  async function exportGuide() {
    if (!current) return;
    msg.textContent = "Generando…";
    try { await document.fonts.load('900 66px Archivo'); await document.fonts.load('600 22px Archivo'); await document.fonts.ready; } catch (e) {}
    const cv = await buildGuide(current);
    const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
    const file = new File([blob], "caza-color-" + slug(current.color.name) + ".png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "Caza el Color" }); msg.textContent = ""; return; }
      catch (e) { if (e && e.name === "AbortError") { msg.textContent = ""; return; } }
    }
    // Fallback (desktop / navegadores sin share)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    msg.textContent = "Listo. Pegá tus fotos encima.";
  }

  // --- Eventos ---
  swatch.addEventListener("click", roll);
  rollBtn.addEventListener("click", roll);
  rerollBtn.addEventListener("click", roll);
  dlBtn.addEventListener("click", exportGuide);

  // Si ya tiraste esta semana, se mantiene el color
  try {
    const saved = localStorage.getItem("cazacolor:" + weekKey(new Date()));
    if (saved) {
      const d = JSON.parse(saved);
      if (d.cellMap) { reveal(d); msg.textContent = "Tu color de la semana."; }
    }
  } catch (e) {}
})();
