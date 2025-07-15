// Gonza Tracker 2.0 - App profesional de seguimiento de gestiones
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const contratos = ["MEL", "RT", "CMZ", "ZAL"];
const estados = ["En proceso", "Finalizado"];
const prioridades = ["Urgente", "Alta", "Media", "Baja"];

export default function GonzaTracker() {
  const [gestiones, setGestiones] = useState(() => {
    const saved = localStorage.getItem('gestiones');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputFrase, setInputFrase] = useState('');
  const [resultado, setResultado] = useState([]);

  useEffect(() => {
    localStorage.setItem('gestiones', JSON.stringify(gestiones));
  }, [gestiones]);

  const generarTituloDesdeFrase = (frase) => {
    const lower = frase.toLowerCase();
    if (lower.includes("revisar") && lower.includes("herramientas")) return "Revisar y liberar listado de Herramientas";
    if (lower.includes("entregar")) return "Entregar documentación requerida";
    if (lower.includes("solicitar")) return "Solicitar aprobación o materiales";
    if (lower.includes("cotizar")) return "Realizar cotización correspondiente";
    return frase.charAt(0).toUpperCase() + frase.slice(1);
  };

  const parseFrase = (texto) => {
    const contrato = contratos.find(c => texto.toLowerCase().includes(c.toLowerCase()));
    const estado = estados.find(e => texto.toLowerCase().includes(e.toLowerCase()));
    const prioridad = prioridades.find(p => texto.toLowerCase().includes(p.toLowerCase()));

    let responsable = "No definido";
    if (texto.toLowerCase().includes("debo") || texto.toLowerCase().includes("tengo que") || texto.toLowerCase().includes("voy a")) {
      responsable = "Gonzalo Valenzuela";
    } else {
      const matchResp = texto.match(/responsable\s*:?\s*([a-zA-Z\s]+)/i);
      if (matchResp) responsable = matchResp[1].trim();
    }

    const comentario = texto.includes("Comentario")
      ? texto.split("Comentario:")[1].trim()
      : texto;

    const titulo = generarTituloDesdeFrase(texto);

    return {
      id: Date.now(),
      contrato: contrato || "No definido",
      estado: estado || "En proceso",
      prioridad: prioridad || "Media",
      responsable,
      titulo,
      historial: [
        {
          fecha: new Date().toLocaleString(),
          comentario,
          estado: estado || "En proceso",
          responsable
        }
      ]
    };
  };

  const agregarFrase = () => {
    if (!inputFrase.trim()) return;
    const gestion = parseFrase(inputFrase);
    setGestiones([...gestiones, gestion]);
    setInputFrase('');
  };

  const exportarExcel = () => {
    const data = gestiones.map(g => ({
      Tarea: g.titulo,
      Contrato: g.contrato,
      Estado: g.estado,
      Responsable: g.responsable,
      Prioridad: g.prioridad,
      "Último Comentario": g.historial[g.historial.length - 1]?.comentario,
      "Última Actualización": g.historial[g.historial.length - 1]?.fecha
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gestiones");
    XLSX.writeFile(wb, "gestiones_gonza_tracker.xlsx");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">🧠 Gonza Tracker 2.0</h1>

      <div className="bg-white p-4 rounded-2xl shadow space-y-3">
        <p className="text-sm text-gray-600">Ejemplo: "Debo revisar listado de herramientas entregadas por personal de MEL"</p>
        <input
          className="w-full p-3 border rounded"
          placeholder="Escribe una frase para agregar una gestión..."
          value={inputFrase}
          onChange={(e) => setInputFrase(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={agregarFrase}>
          Agregar gestión por frase
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Gestiones registradas</h2>
          <button
            onClick={exportarExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
            <Download size={16} /> Exportar a Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Tarea</th>
                <th className="p-2 text-left">Contrato</th>
                <th className="p-2 text-left">Responsable</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-left">Prioridad</th>
                <th className="p-2 text-left">Última actualización</th>
              </tr>
            </thead>
            <tbody>
              {gestiones.map(g => (
                <tr key={g.id} className="border-t">
                  <td className="p-2">{g.titulo}</td>
                  <td className="p-2">{g.contrato}</td>
                  <td className="p-2">{g.responsable}</td>
                  <td className="p-2">{g.estado}</td>
                                    <td className="p-2">{g.prioridad}</td>
                  <td className="p-2">
                    {g.historial[g.historial.length - 1]?.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

