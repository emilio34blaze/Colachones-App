import { useState, useEffect } from "react";

const TEMPORADA_CHILE = `Estamos en otoño en Chile (abril-junio 2026). Frutas de temporada: manzanas, peras, uvas, kiwi, naranjas, mandarinas, membrillos, higos. Verduras de temporada: zapallo, zanahoria, betarraga, brócoli, coliflor, espinaca, acelga, choclo.`;

const FILTROS = [
  { id: "todo", label: "Todo", icon: "🌿" },
  { id: "fruta", label: "Fruta", icon: "🍎" },
  { id: "dulce", label: "Dulce", icon: "🍯" },
  { id: "salado", label: "Salado", icon: "🧂" },
  { id: "rapido", label: "Rápido", icon: "⚡" },
];

function ColacionCard({ colacion, onNueva, loading }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [colacion]);

  if (loading) {
    return (
      <div style={{
        background: "#ffffff", border: "1px solid #e5e7eb",
        borderRadius: 16, padding: "2rem 1.25rem", minHeight: 220,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <div style={{ fontSize: 36 }}>🥦</div>
        <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center" }}>
          Buscando una colación deliciosa...
        </p>
      </div>
    );
  }

  if (!colacion) return null;

  const imgQuery = encodeURIComponent(
    (colacion.nombre + " " + (colacion.ingredientes?.[0] || "") + " healthy kids snack").toLowerCase()
  );
  const imgSrc = `https://source.unsplash.com/featured/600x300/?${imgQuery}`;

  return (
    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
      {!imgError && (
        <div style={{ width: "100%", height: 190, background: "#f3f4f6", position: "relative" }}>
          <img src={imgSrc} alt={colacion.nombre} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
            padding: "24px 12px 10px",
          }}>
            <span style={{ fontSize: 22 }}>{colacion.emoji}</span>
          </div>
        </div>
      )}
      <div style={{ padding: "1.25rem" }}>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Colación del día
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px", color: "#111827" }}>
          {imgError && <span style={{ marginRight: 8 }}>{colacion.emoji}</span>}
          {colacion.nombre}
        </h2>
        {colacion.etiquetas && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {colacion.etiquetas.map(e => (
              <span key={e} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 99,
                background: "#eff6ff", color: "#2563eb", fontWeight: 500,
              }}>{e}</span>
            ))}
          </div>
        )}
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 14px", lineHeight: 1.6 }}>
          {colacion.descripcion}
        </p>
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Ingredientes
          </p>
          <ul style={{ paddingLeft: 18 }}>
            {colacion.ingredientes?.map((ing, i) => (
              <li key={i} style={{ fontSize: 14, color: "#111827", lineHeight: 1.9 }}>{ing}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Preparación
          </p>
          <p style={{ fontSize: 14, color: "#111827", lineHeight: 1.6 }}>{colacion.preparacion}</p>
        </div>
        {colacion.consejo && (
          <div style={{ borderLeft: "3px solid #86efac", paddingLeft: 10, marginBottom: 18 }}>
            <p style={{ fontSize: 13, color: "#16a34a", lineHeight: 1.5 }}>💡 {colacion.consejo}</p>
          </div>
        )}
        <button onClick={onNueva} style={{
          width: "100%", padding: "12px", fontSize: 15, fontWeight: 500,
          borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb",
          cursor: "pointer", color: "#111827",
        }}>
          Otra idea ↗
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [colacion, setColacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todo");
  const [historial, setHistorial] = useState([]);
  const [vistaHistorial, setVistaHistorial] = useState(false);
  const [error, setError] = useState(null);

  async function obtenerColacion(filtroActual) {
    setLoading(true);
    setError(null);
    setVistaHistorial(false);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    const historialTexto = historial.length > 0
      ? `Ya sugeriste estas colaciones hoy, no las repitas: ${historial.join(", ")}.` : "";
    const filtroTexto = filtroActual !== "todo"
      ? `La colación debe ser principalmente de tipo: ${filtroActual}.` : "";

    const prompt = `Eres un nutricionista infantil experto. Sugiere UNA colación saludable para una niña chilena de 4 años.
${TEMPORADA_CHILE}
${filtroTexto}
${historialTexto}

Responde SOLO con un JSON válido, sin markdown ni texto adicional:
{
  "nombre": "nombre corto y atractivo",
  "emoji": "un emoji representativo",
  "etiquetas": ["etiqueta1", "etiqueta2"],
  "descripcion": "descripción breve y apetitosa en 1-2 oraciones",
  "ingredientes": ["ingrediente 1", "ingrediente 2", "ingrediente 3"],
  "preparacion": "instrucciones simples para los papás, máximo 3-4 pasos en un párrafo",
  "consejo": "un consejo nutricional o de presentación para niños"
}
Etiquetas posibles: Fruta, Dulce, Salado, Rápido, Sin gluten, Proteína, Integral, Temporada.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("API Error:", res.status, errData);
        throw new Error(`Error ${res.status}: ${errData?.error?.message || "desconocido"}`);
      }

      const data = await res.json();
      const texto = data.content?.find(b => b.type === "text")?.text || "";
      const clean = texto.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setColacion(parsed);
      setHistorial(prev => [...prev.slice(-9), parsed.nombre]);
    } catch (e) {
      console.error("Error completo:", e);
      setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { obtenerColacion("todo"); }, []);

  function cambiarFiltro(f) {
    setFiltro(f);
    obtenerColacion(f);
  }

  return (
    <div style={{ width: "100%", maxWidth: 420, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Otoño 2026 · Chile
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#111827" }}>Colaciones saludables</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Ideas para tu hija de 4 años 🧡</p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {FILTROS.map(f => (
          <button key={f.id} onClick={() => cambiarFiltro(f.id)} style={{
            fontSize: 12, padding: "6px 13px", cursor: "pointer",
            background: filtro === f.id ? "#eff6ff" : "#ffffff",
            color: filtro === f.id ? "#2563eb" : "#6b7280",
            border: filtro === f.id ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
            borderRadius: 99, fontWeight: filtro === f.id ? 600 : 400,
          }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
          <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>
        </div>
      )}

      {!vistaHistorial && (
        <ColacionCard colacion={colacion} onNueva={() => obtenerColacion(filtro)} loading={loading} />
      )}

      {historial.length > 1 && !loading && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setVistaHistorial(!vistaHistorial)}
            style={{ fontSize: 13, color: "#6b7280", border: "none", background: "none", padding: 0, cursor: "pointer" }}>
            {vistaHistorial ? "← Volver" : `Ver historial del día (${historial.length - 1})`}
          </button>
          {vistaHistorial && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Colaciones vistas hoy
              </p>
              {historial.slice(0, -1).map((nombre, i) => (
                <div key={i} style={{
                  padding: "10px 14px", background: "#ffffff",
                  border: "1px solid #e5e7eb", borderRadius: 10,
                  marginBottom: 6, fontSize: 14, color: "#111827",
                }}>{nombre}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
