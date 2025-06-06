import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN = import.meta.env.VITE_API_KEY || "admin";

export default function Overview() {
  const [overview, setOverview] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        // Fetch upstreams
        const upstreamRes = await fetch(`${API_URL}/apisix/admin/upstreams`, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
          },
        });

        const upstreamJson = await upstreamRes.json();
        const upstreamNodes = upstreamJson.node?.nodes || [];

        // Fetch routes
        const routeRes = await fetch(`${API_URL}/apisix/admin/routes`, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
          },
        });

        const routeJson = await routeRes.json();
        const allRoutes = routeJson.node?.nodes || [];

        // Step 3: Map routes under upstreams
        const result = upstreamNodes.map((upstreamNode) => {
          const upstreamId = upstreamNode.value.id;
          const routes = allRoutes
            .filter((routeNode) => routeNode.value?.upstream_id === upstreamId)
            .map((r) => {
              const val = r.value;
              return {
                id: val.id,
                uri: val.uri,
                method: val.methods?.join(", "),
                rewrite: val.plugins?.["proxy-rewrite"]?.uri || "-",
                auth: val.plugins?.["key-auth"] ? "🔒" : "",
              };
            });

          return {
            upstreamId,
            routes,
          };
        });

        setOverview(result);
      } catch (err) {
        console.error("Failed to fetch upstream overview", err);
        setError("Cannot fetch upstream overview");
      }
    };

    fetchOverview();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 text-black">
      <h2 className="text-lg sm:text-xl font-bold mb-4">
        🗺️ Upstream Overview
      </h2>
      {overview.length === 0 ? (
        <p>No upstreams found</p>
      ) : (
        overview.map(({ upstreamId, routes }) => (
          <div
            key={upstreamId}
            className="mb-6 p-4 bg-white rounded shadow border border-gray-200"
          >
            <h3 className="text-sm sm:text-base font-bold mb-2">
              {upstreamId}
            </h3>
            {routes.length === 0 ? (
              <p className="text-xs sm:text:sm text-gray-500">
                No routes linked
              </p>
            ) : (
              <ul className="text-xs sm:text:sm space-y-1">
                {routes.map((r) => (
                  <li
                    key={r.id}
                    className="border-b border-dashed pb-1 last:border-none"
                  >
                    <span className="font-semibold">{r.id}</span> —{" "}
                    <span>{r.method}</span>{" "}
                    <code className="text-blue-700">{r.uri}</code> →{" "}
                    <code className="text-green-600">{r.rewrite}</code> {r.auth}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}
