// Instalar: npm install
// Ejecutar: LV_ANTIBYPASS_TOKEN=tu_token KEY_TTL_HOURS=24 node server.js
// Pruebas locales sin Linkvertise: DEV_SKIP_LV=1 node server.js  y abre /getkey?hash=prueba1
import express from "express";
import crypto from "crypto";
import Database from "better-sqlite3";

const PORT = process.env.PORT || 3000;
const LV_TOKEN = process.env.LV_ANTIBYPASS_TOKEN;
const TTL_MS = Number(process.env.KEY_TTL_HOURS || 24) * 60 * 60 * 1000; // duración de cada key
const DEV_SKIP_LV = process.env.DEV_SKIP_LV === "1";

// ---------- Base de datos (persiste entre reinicios) ----------
const db = new Database(process.env.DB_PATH || "keys.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS keys (
    key     TEXT PRIMARY KEY,
    created INTEGER NOT NULL,
    expires INTEGER NOT NULL,
    hwid    TEXT
  );
  CREATE TABLE IF NOT EXISTS hashes (
    hash TEXT PRIMARY KEY,   -- hash de Linkvertise (1 hash = 1 key)
    key  TEXT NOT NULL
  );
`);
const q = {
  insertKey:  db.prepare("INSERT INTO keys (key, created, expires) VALUES (?, ?, ?)"),
  insertHash: db.prepare("INSERT INTO hashes (hash, key) VALUES (?, ?)"),
  hashRow:    db.prepare("SELECT key FROM hashes WHERE hash = ?"),
  getKey:     db.prepare("SELECT * FROM keys WHERE key = ?"),
  setHwid:    db.prepare("UPDATE keys SET hwid = ? WHERE key = ?"),
  purge:      db.prepare("DELETE FROM keys WHERE expires < ?"),
};
// Limpieza de keys expiradas cada hora
setInterval(() => q.purge.run(Date.now()), 60 * 60 * 1000);

const newKey = () => "KEY-" + crypto.randomBytes(12).toString("hex").toUpperCase();

// ---------- App ----------
const app = express();
app.use(express.json());

// CORS: necesario porque el userscript usa fetch() desde otro dominio
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function keyPage(key, expires) {
  const fecha = new Date(expires).toLocaleString("es-CO", { timeZone: "America/Bogota" });
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tu key</title>
<body style="font-family:system-ui;background:#14141a;color:#eee;display:grid;place-items:center;height:100vh;margin:0">
<div style="text-align:center;background:#1e1e26;padding:32px;border-radius:14px">
  <h2>🔑 Tu key</h2>
  <code id="k" style="font-size:1.4em;background:#000;padding:10px 16px;border-radius:8px;display:inline-block">${key}</code>
  <p><button onclick="navigator.clipboard.writeText(document.getElementById('k').textContent);this.textContent='¡Copiada!'"
     style="padding:8px 16px;border-radius:8px;border:0;cursor:pointer">Copiar</button></p>
  <p style="color:#9ca3af">Válida hasta: ${fecha}</p>
</div></body>`;
}

// 1) Linkvertise redirige aquí con ?hash=XXXX
app.get("/getkey", async (req, res) => {
  const hash = String(req.query.hash || "");
  if (!hash) return res.status(403).send("Debes pasar por Linkvertise para obtener tu key.");

  // Si el usuario refresca la página, se le muestra la misma key (sin generar otra)
  const prev = q.hashRow.get(hash);
  if (prev) {
    const k = q.getKey.get(prev.key);
    if (k && Date.now() < k.expires) return res.send(keyPage(k.key, k.expires));
    return res.status(403).send("Este enlace ya fue usado y su key expiró. Vuelve a pasar por Linkvertise.");
  }

  if (!DEV_SKIP_LV) {
    try {
      // Verifica en Linkvertise que realmente completó los pasos.
      // Confirma método/URL en la documentación vigente de Linkvertise (Anti-Bypassing).
      const r = await fetch(
        `https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${LV_TOKEN}&hash=${encodeURIComponent(hash)}`,
        { method: "POST" }
      );
      if ((await r.text()).trim().toUpperCase() !== "TRUE") {
        return res.status(403).send("Verificación fallida.");
      }
    } catch {
      return res.status(502).send("No se pudo verificar con Linkvertise. Intenta de nuevo.");
    }
  }

  // Una key NUEVA y aleatoria por cada hash; la transacción evita doble uso simultáneo
  const key = newKey();
  const created = Date.now();
  const expires = created + TTL_MS;
  try {
    db.transaction(() => {
      q.insertHash.run(hash, key);       // falla si el hash ya existía
      q.insertKey.run(key, created, expires);
    })();
  } catch {
    return res.status(409).send("Este enlace ya fue usado.");
  }
  res.send(keyPage(key, expires));
});

// 2) El userscript valida la key aquí
app.post("/validate", (req, res) => {
  const { key, hwid } = req.body || {};
  if (typeof key !== "string" || typeof hwid !== "string") {
    return res.json({ valid: false, reason: "Solicitud inválida" });
  }
  const row = q.getKey.get(key);
  if (!row) return res.json({ valid: false, reason: "Key inexistente" });
  if (Date.now() > row.expires) return res.json({ valid: false, reason: "Key expirada" });

  if (!row.hwid) q.setHwid.run(hwid, key);            // se vincula al primer dispositivo
  else if (row.hwid !== hwid) return res.json({ valid: false, reason: "Key usada en otro dispositivo" });

  res.json({ valid: true, expires: row.expires });
});

app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT} (key válida ${TTL_MS / 3600000} h)`));
