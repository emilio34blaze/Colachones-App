import { useState, useEffect } from "react";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

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
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "2rem 1.25rem",
        minHeight: 220,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <div style={{ fontSize: 36 }}>🥦</div>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14, textAlign: "center" }}>
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
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      overflow: "hidden",
    }}>
      {!imgError && (
        <div style={{ width: "100%", height: 190, background: "var(--color-background-secondary)", position: "relative" }}>
          <img
            src={imgSrc}
            alt={colacion.nombre}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
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
        <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Colación del día
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px", color: "var(--color-text-primary)" }}>
          {imgError && <span style={{ marginRight: 8 }}>{colacion.emoji}</span>}
          {colacion.nombre}
        </h2>

        {colacion.etiquetas && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {colacion.etiquetas.map(e => (
              <span key={e} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 99,
                background: "var(--color-background-info)",
                color: "var(--color-text-info)", fontWeight: 500,
              }}>{e}</span>
            ))}
          </div>
        )}

        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 14px", lineHeight: 1.6 }}>
          {colacion.descripcion}
        </p>

        <div style={{
          background: "var(--color-background-secondary)",
          borderRadius: "var(--border-radius-md)",
          padding: "12px", marginBottom: 14,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Ingredientes
          </p>
          <ul style={{ paddingLeft: 18 }}>
            {colacion.ingredientes?.map((ing, i) => (
              <li key={i} style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.9 }}>{ing}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Preparación
          </p>
          <p style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
            {colacion.preparacion}
          </p>
        </div>

        {colacion.consejo && (
          <div style={{
            borderLeft: "3px solid var(--color-border-success)",
            paddingLeft: 10, marginBottom: 18,
          }}>
            <p style={{ fontSize: 13, color: "var(--color-text-success)", lineHeight: 1.5 }}>
              💡 {colacion.consejo}
            </p>
          </div>
        )}

        <button
          onClick={onNueva}
          style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 500, borderRadius: "var(--border-radius-md)" }}
        >
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
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const texto = data.content?.find(b => b.type === "text")?.text || "";
      const clean = texto.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setColacion(parsed);
      setHistorial(prev => [...prev.slice(-9), parsed.nombre]);
    } catch (e) {
      setError("No se pudo obtener la colación. Verifica tu conexión e intenta de nuevo.");
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
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Otoño 2026 · Chile
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: "var(--color-text-primary)" }}>
          Colaciones saludables
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "4px 0 0" }}>
          Ideas para tu hija de 4 años 🧡
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {FILTROS.map(f => (
          <button key={f.id} onClick={() => cambiarFiltro(f.id)} style={{
            fontSize: 12, padding: "6px 13px", cursor: "pointer",
            background: filtro === f.id ? "var(--color-background-info)" : "var(--color-background-primary)",
            color: filtro === f.id ? "var(--color-text-info)" : "var(--color-text-secondary)",
            border: filtro === f.id ? "0.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
            borderRadius: 99, fontWeight: filtro === f.id ? 600 : 400,
          }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          background: "var(--color-background-danger)",
          border: "0.5px solid var(--color-border-danger)",
          borderRadius: "var(--border-radius-md)",
          padding: "12px", marginBottom: 12,
        }}>
          <p style={{ color: "var(--color-text-danger)", fontSize: 14 }}>{error}</p>
        </div>
      )}

      {!vistaHistorial && (
        <ColacionCard colacion={colacion} onNueva={() => obtenerColacion(filtro)} loading={loading} />
      )}

      {historial.length > 1 && !loading && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setVistaHistorial(!vistaHistorial)}
            style={{ fontSize: 13, color: "var(--color-text-secondary)", border: "none", background: "none", padding: 0 }}
          >
            {vistaHistorial ? "← Volver" : `Ver historial del día (${historial.length - 1})`}
          </button>
          {vistaHistorial && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Colaciones vistas hoy
              </p>
              {historial.slice(0, -1).map((nombre, i) => (
                <div key={i} style={{
                  padding: "10px 14px",
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-md)",
                  marginBottom: 6, fontSize: 14,
                  color: "var(--color-text-primary)",
                }}>{nombre}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
