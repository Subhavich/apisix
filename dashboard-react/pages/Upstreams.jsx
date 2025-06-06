import { useEffect, useState } from "react";
import { SelectField, FormField } from "../components/Forms";
import { Link } from "react-router-dom";
import ErrorModal from "../components/ErrorModal";
import DefaultServices from "../components/ServicesList";
const API_URL = import.meta.env.VITE_API_URL;
const ADMIN = import.meta.env.VITE_API_KEY || "admin";

export default function Upstreams() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    id: "",
    node: "",
    scheme: "http",
    type: "roundrobin",
    pass_host: "pass",
    upstream_host: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/apisix/admin/upstreams`, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
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
    <div className="p-4">
      <h1 className="">Upstreams</h1>
      <DefaultServices />
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <section className="flex flex-col sm:flex-row justify-between gap-4">
        <aside className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:max-w-7/12">
          {data && data.length > 0 ? (
            data.map((node, i) => (
              <Item
                key={node.key || i}
                node={node}
                setData={setData}
                setError={setError}
                setForm={setForm}
              />
            ))
          ) : (
            <p className="my-2">Please Create Upstream</p>
          )}
        </aside>

        <Create
          form={form}
          setForm={setForm}
          setData={setData}
          setError={setError}
        />
      </section>
    </div>
  );
}

function Create({ form, setForm, setError, setData }) {
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
      setError("Failed to create upstream");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="md:max-w-[375px] sm:w-full mt-4 p-4 shadow border border-gray-200 rounded text-black flex flex-col gap-3"
    >
      <h2 className="text-lg font-bold">Create/Edit Upstream</h2>

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
        placeholder="e.g. jsonplaceholder.typicode.com:443"
      />

      <SelectField
        label="Scheme"
        name="scheme"
        value={form.scheme}
        onChange={handleChange}
        options={[
          { value: "http", label: "http (e.g. Port 80)" },
          { value: "https", label: "https (e.g. Port 443)" },
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
          { value: "pass", label: "pass (keep incoming Host)" },
          { value: "rewrite", label: "rewrite (override host)" },
        ]}
      />

      {form.pass_host === "rewrite" && (
        <FormField
          label="Upstream Host"
          name="upstream_host"
          value={form.upstream_host}
          onChange={handleChange}
          required
          placeholder="e.g. jsonplaceholder.typicode.com"
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

function Item({ node, setData, setError, setForm }) {
  const { id, scheme, type, pass_host, nodes, upstream_host } = node.value;
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

  const handleFillForm = () => {
    const nodeEntry = nodes && Object.entries(nodes)[0];
    setForm({
      id,
      node: nodeEntry ? nodeEntry[0] : "",
      scheme,
      type,
      pass_host,
      upstream_host: upstream_host || "",
    });
  };

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
    <div
      className="my-4 px-2 py-3 bg-white 
      flex flex-col justify-between
      gap-1 max-h-56 md:w-40 
      md:max-w-[375px] 
      text-black rounded 
      cursor-pointer shadow border 
      border-gray-200 hover:bg-gray-300 transition"
      onClick={handleFillForm}
    >
      <h3 className="text-xs sm:text-sm font-bold">Upstream: {id}</h3>
      <p className="text-xs">Scheme: {scheme}</p>
      <p className="text-xs">Type: {type}</p>

      {linkedRoutes.length > 0 && (
        <div className="text-xs mt-2">
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
