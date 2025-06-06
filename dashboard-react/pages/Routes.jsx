import { useEffect, useState } from "react";
import { SelectField, FormField } from "../components/Forms";
import { Link } from "react-router-dom";
import ErrorModal from "../components/ErrorModal";
import UpstreamList from "../components/UpstreamList";

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN = import.meta.env.VITE_API_KEY || "admin";

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    id: "",
    uri: "",
    method: "GET",
    upstream_id: "",
    rewrite_uri: "",
    useAuth: false,
  });

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
      <UpstreamList />
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <div>
        {routes.length > 0 ? (
          routes.map((route, i) => (
            <RouteItem
              key={route.key || i}
              route={route}
              setRoutes={setRoutes}
              setError={setError}
              setForm={setForm}
            />
          ))
        ) : (
          <p>No routes found</p>
        )}
      </div>
      <CreateRoute
        form={form}
        setForm={setForm}
        setRoutes={setRoutes}
        setError={setError}
      />
    </>
  );
}

function CreateRoute({ form, setForm, setRoutes, setError }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id || !form.uri || !form.upstream_id)
      return alert("ID, URI, and Upstream ID are required");

    const body = {
      id: form.id,
      uri: form.uri,
      methods: [form.method],
      upstream_id: form.upstream_id,
      status: 1,
      plugins: {
        "proxy-rewrite": {
          uri: form.rewrite_uri || form.uri,
        },
        ...(form.useAuth && { "key-auth": {} }),
      },
    };

    try {
      const res = await fetch(`${API_URL}/apisix/admin/routes/${form.id}`, {
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
        useAuth: false,
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
        label="Public URI (e.g. /api/posts)"
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
        label="Rewrite URI (e.g. /wp-json/wp/v2/posts)"
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

function RouteItem({ route, setRoutes, setError, setForm }) {
  const { id, uri, methods, upstream_id, plugins } = route.value;

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

  const handleFillForm = () => {
    setForm({
      id,
      uri,
      method: methods?.[0] || "GET",
      upstream_id: upstream_id || "",
      rewrite_uri: plugins?.["proxy-rewrite"]?.uri || uri,
      useAuth: Boolean(plugins?.["key-auth"]),
    });
  };

  return (
    <div
      className="my-4 p-4 bg-white text-black rounded shadow cursor-pointer hover:bg-gray-50 transition"
      onClick={handleFillForm}
    >
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
