import { useEffect, useState } from "react";
import { SelectField, FormField } from "../components/Forms";
import { Link } from "react-router-dom";
import ErrorModal from "../components/ErrorModal";

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN = import.meta.env.VITE_API_KEY || "admin";

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);

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
        setRoutes(json.node?.nodes || []);
      } catch (err) {
        console.error("Failed to fetch routes", err);
        setError("Failed to fetch routes");
      }
    };

    fetchRoutes();
  }, []);

  return (
    <>
      <h1>Routes</h1>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <div>
        {routes.length > 0 ? (
          routes.map((route, i) => (
            <RouteItem
              key={route.key || i}
              route={route}
              setRoutes={setRoutes}
              setError={setError}
            />
          ))
        ) : (
          <p>No routes found</p>
        )}
      </div>
      <CreateRoute setRoutes={setRoutes} setError={setError} />
    </>
  );
}

function CreateRoute({ setRoutes, setError }) {
  const [form, setForm] = useState({
    id: "",
    uri: "",
    method: "GET",
    upstream_id: "",
    rewrite_uri: "",
    useAuth: false, // <-- new
  });

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setForm((prev) => ({ ...prev, [name]: value }));
  // };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, uri, method, upstream_id, rewrite_uri } = form;

    if (!id || !uri || !upstream_id)
      return alert("ID, URI, and Upstream ID are required");

    // const body = {
    //   id,
    //   uri,
    //   methods: [method],
    //   upstream_id,
    //   status: 1,
    //   plugins: {
    //     "proxy-rewrite": {
    //       uri: rewrite_uri || uri, // fallback to match uri if not rewritten
    //     },
    //   },
    // };
    const body = {
      id,
      uri,
      methods: [method],
      upstream_id,
      status: 1,
      plugins: {
        "proxy-rewrite": {
          uri: rewrite_uri || uri,
        },
        ...(form.useAuth && { "key-auth": {} }), // conditional inclusion
      },
    };

    try {
      const res = await fetch(`${API_URL}/apisix/admin/routes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": ADMIN,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create route");

      const fetchRes = await fetch(`${API_URL}/apisix/admin/routes`, {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": ADMIN,
        },
      });

      const json = await fetchRes.json();
      setRoutes(json.node?.nodes || []);

      // Reset form
      setForm({
        id: "",
        uri: "",
        method: "GET",
        upstream_id: "",
        rewrite_uri: "",
      });
    } catch (err) {
      console.error("Create error:", err);
      setError("Failed to create route");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-4 bg-white text-black flex flex-col gap-3"
    >
      <h2 className="text-lg font-bold">Create Route</h2>

      <FormField
        name="id"
        label="Route ID"
        value={form.id}
        onChange={handleChange}
        required
      />
      <FormField
        name="uri"
        label="Public URI (e.g. /chitin)"
        value={form.uri}
        onChange={handleChange}
        required
      />
      <FormField
        name="upstream_id"
        label="Upstream ID"
        value={form.upstream_id}
        onChange={handleChange}
        required
      />
      <SelectField
        name="method"
        label="HTTP Method"
        value={form.method}
        onChange={handleChange}
        options={["GET", "POST", "PUT", "DELETE"].map((m) => ({
          value: m,
          label: m,
        }))}
      />
      <FormField
        name="rewrite_uri"
        label="Rewrite URI (e.g. /api/data)"
        value={form.rewrite_uri}
        onChange={handleChange}
        placeholder="Optional, defaults to same as Public URI"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="useAuth"
          id="useAuth"
          checked={form.useAuth}
          onChange={handleChange}
        />
        <label htmlFor="useAuth">Require API Key (key-auth)</label>
      </div>

      <button
        type="submit"
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Route
      </button>
    </form>
  );
}

function RouteItem({ route, setRoutes, setError }) {
  const { id, uri, methods, upstream_id } = route.value;

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${API_URL}/apisix/admin/routes/${id}?force=true`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      const fetchRes = await fetch(`${API_URL}/apisix/admin/routes`, {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": ADMIN,
        },
      });

      const json = await fetchRes.json();
      setRoutes(json.node?.nodes || []);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete route");
    }
  };

  return (
    <div className="my-4 p-4 bg-white text-black rounded shadow">
      <h3 className="text-lg font-bold">Route: {id}</h3>
      <p>URI: {uri}</p>
      <p>Method(s): {methods?.join(", ")}</p>
      <p>Upstream ID: {upstream_id}</p>
      <button
        onClick={handleDelete}
        className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
}
