import { useEffect, useState } from "react";
import { SelectField, FormField } from "../components/Forms";
import { Link } from "react-router-dom";
import ErrorModal from "../components/ErrorModal";
const API_URL = import.meta.env.VITE_API_URL;
const ADMIN = import.meta.env.VITE_API_KEY || "admin";
export default function Upstreams() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/apisix/admin/upstreams`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": `${ADMIN}`,
          },
        });
        const json = await res.json();
        setData(json.node.nodes);
      } catch (err) {
        setError("Failed to fetch upstreams");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h1>Upstreams</h1>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <div>
        {data && data.length > 0 ? (
          data.map((node, i) => (
            <Item
              key={node.key || i}
              node={node}
              setData={setData}
              setError={setError}
            />
          ))
        ) : (
          <p>Please Create Upstream</p>
        )}
      </div>
      <Create setData={setData} setError={setError} />
    </>
  );
}

function Create({ setData }) {
  const [form, setForm] = useState({
    id: "",
    node: "",
    scheme: "http",
    type: "roundrobin",
    pass_host: "pass",
    upstream_host: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id || !form.node) return alert("ID and Node are required");

    const nodeObj = { [form.node]: 1 };

    const body = {
      id: form.id,
      nodes: nodeObj,
      type: form.type,
      scheme: form.scheme,
      pass_host: form.pass_host,
    };

    if (form.pass_host === "rewrite" && form.upstream_host) {
      body.upstream_host = form.upstream_host;
    }

    try {
      const res = await fetch(`${API_URL}/apisix/admin/upstreams/${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": ADMIN,
        },
        body: JSON.stringify(body),
      });
      console.log(res);
      if (!res.ok) throw new Error("Failed to create upstream");

      // Reset form
      setForm({
        id: "",
        node: "",
        scheme: "http",
        type: "roundrobin",
        pass_host: "pass",
        upstream_host: "",
      });

      // Refresh data
      const fetchRes = await fetch(`${API_URL}/apisix/admin/upstreams`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": ADMIN,
        },
      });

      const json = await fetchRes.json();
      setData(json.node.nodes);
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-4 bg-white text-black flex flex-col gap-3"
    >
      <h2 className="text-lg font-bold">Create New Upstream</h2>

      <FormField
        label="Upstream ID"
        name="id"
        value={form.id}
        onChange={handleChange}
        required
        placeholder="Unique name like 'json' or 'gofiber'"
      />

      <FormField
        label="Target Node"
        name="node"
        value={form.node}
        onChange={handleChange}
        required
        placeholder="Format: domain:port (e.g. jsonplaceholder.typicode.com:443)"
      />
      <SelectField
        label="Scheme"
        name="scheme"
        value={form.scheme}
        onChange={handleChange}
        placeholder="Use 80 for HTTP or 443 for HTTPS"
        options={[
          { value: "http", label: "http (e.g. Port 8080, 80, 8888)" },
          { value: "https", label: "https (e.g. Port 443, 8443)" },
        ]}
      />

      <SelectField
        label="Load Balancing Type"
        name="type"
        value={form.type}
        onChange={handleChange}
        options={[
          { value: "roundrobin", label: "roundrobin" },
          { value: "chash", label: "chash" },
        ]}
      />
      <SelectField
        label="Pass Host"
        name="pass_host"
        value={form.pass_host}
        onChange={handleChange}
        options={[
          { value: "pass", label: "pass (keep incoming Host header)" },
          { value: "rewrite", label: "rewrite (override with upstream host)" },
        ]}
      />

      {form.pass_host === "rewrite" && (
        <FormField
          label="Upstream Host"
          name="upstream_host"
          value={form.upstream_host}
          onChange={handleChange}
          required
          placeholder="Domain name (e.g. jsonplaceholder.typicode.com)"
        />
      )}

      <button
        type="submit"
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Upstream
      </button>
    </form>
  );
}

function Item({ node, setData, setError }) {
  const { id, scheme, type } = node.value;
  const [linkedRoutes, setLinkedRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${API_URL}/apisix/admin/routes`, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
          },
        });
        const json = await res.json();
        const allRoutes = json.node?.nodes || [];

        const matches = allRoutes.filter((r) => r.value?.upstream_id === id);

        setLinkedRoutes(matches);
      } catch (err) {
        console.error("Failed to fetch routes for upstream", err);
      }
    };

    fetchRoutes();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${API_URL}/apisix/admin/upstreams/${id}?force=true`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      const fetchRes = await fetch(`${API_URL}/apisix/admin/upstreams`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": ADMIN,
        },
      });

      const json = await fetchRes.json();
      setData(json.node.nodes);
    } catch (err) {
      console.error("Delete error:", err);
      setError(
        "Failed to delete upstream, Try to delete all route to this upstream"
      );
    }
  };

  return (
    <div className="my-4 p-4 bg-white text-black rounded shadow">
      <h3 className="font-bold text-lg">{id}</h3>
      <p>Scheme: {scheme}</p>
      <p>Type: {type}</p>

      {linkedRoutes.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold">Linked Routes:</p>
          <ul className="list-disc list-inside">
            {linkedRoutes.map((route) => (
              <li key={route.key}>
                <Link to={`/routes`} className="text-blue-600 hover:underline">
                  {route.value.id || route.key}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleDelete}
        className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
}
