// EchantillonsTable.jsx
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";

const EchantillonsTable = forwardRef(
  ({ clientId, produitId, phase, onTableDataChange, initialStart, initialEnd }, ref) => {
    const [start, setStart] = useState(initialStart || "");
    const [end, setEnd] = useState(initialEnd || "");
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const fetchRows = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const params = { client_id: clientId };
        if (produitId) params.produit_id = produitId;
        if (phase) params.phase = phase;
        if (start) params.start = start;
        if (end) params.end = end;

        const resp = await axios.get("http://localhost:5000/api/echantillons", { params });
        setRows(resp.data || []);
        setSelected(new Set());
        onTableDataChange(resp.data || [], start, end);
      } catch (err) {
        console.error("Erreur fetch echantillons", err);
        setRows([]);
        onTableDataChange([], start, end);
      } finally {
        setLoading(false);
      }
    };

    // expose refresh method to parent
    useImperativeHandle(ref, () => ({
      refresh: fetchRows,
    }));

    useEffect(() => {
      if (!clientId) {
        setRows([]);
        onTableDataChange([], "", "");
        return;
      }
      fetchRows();
      // eslint-disable-next-line
    }, [clientId, produitId, phase]);

    const toggleRow = (id) => {
      const s = new Set(selected);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      setSelected(s);
    };

    const toggleAll = () => {
      if (selected.size === rows.length) {
        setSelected(new Set());
      } else {
        setSelected(new Set(rows.map((r) => r.id)));
      }
    };

    return (
      <div>
        <div
          style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
        >
          <label>
            Du{" "}
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            Au{" "}
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <button onClick={fetchRows} disabled={loading || !clientId}>
            Filtrer
          </button>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => {
                const selectedRows = rows.filter((r) => selected.has(r.id));
                if (selectedRows.length === 0) return;
                const csv = [
                  Object.keys(selectedRows[0] || {}).join(","),
                  ...selectedRows.map((r) =>
                    Object.values(r)
                      .map((v) =>
                        `"${(v ?? "").toString().replace(/"/g, '""')}"`
                      )
                      .join(",")
                  ),
                ].join("\n");
                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `echantillons_${clientId}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={selected.size === 0}
            >
              Exporter sélection
            </button>
          </div>
        </div>

        <table
          className="table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={rows.length > 0 && selected.size === rows.length}
                />
              </th>
              <th>Date</th>
              <th>Num</th>
              <th>Phase</th>
              <th>RC28J</th>
              <th>RC7J</th>
              <th>RC2J</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleRow(r.id)}
                  />
                </td>
                <td>{r.date_test}</td>
                <td>{r.num_ech}</td>
                <td>{r.phase}</td>
                <td>{r.rc28j}</td>
                <td>{r.rc7j}</td>
                <td>{r.rc2j}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>Aucune donnée pour cette période / client</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

export default EchantillonsTable;
