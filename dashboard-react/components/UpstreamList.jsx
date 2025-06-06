import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN = import.meta.env.VITE_API_KEY || "admin";

export default function UpstreamList() {
  const [upstreams, setUpstreams] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpstreams = async () => {
      try {
        const res = await fetch(`${API_URL}/apisix/admin/upstreams`, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
          },
        });

        const json = await res.json();
        const rawNodes = json.node?.nodes || [];

        const simplified = rawNodes.map((node) => {
          const id = node.value.id;
          const nodeKey = Object.keys(node.value.nodes || {})[0] || "—";
          return { id, nodeKey };
        });

        setUpstreams(simplified);
      } catch (err) {
        console.error("Error fetching upstreams:", err);
        setError(true);
      }
    };

    fetchUpstreams();
  }, []);

  if (error)
    return (
      <p className="text-red-500">Unable to load Upstream at this moment</p>
    );

  return (
    <div className="mt-4 p-4 shadow text-white border border-gray-200 bg-blue-500 rounded  ">
      <h2 className="text-lg font-bold mb-2">Upstream List</h2>
      <ul className="list-disc">
        {upstreams.map(({ id, nodeKey }) => (
          <li className=" list-none" key={id}>
            <strong>{id}</strong>: {nodeKey}
          </li>
        ))}
      </ul>
    </div>
  );
}
