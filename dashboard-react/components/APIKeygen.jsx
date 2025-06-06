import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN = import.meta.env.VITE_API_KEY || "admin";

export default function ApiKeyGenerator() {
  const [consumerName, setConsumerName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");

  const generateRandomKey = () => {
    return Math.random().toString(36).substring(2, 16);
  };

  const handleGenerate = async () => {
    if (!consumerName) return alert("Please enter a consumer name");

    const key = generateRandomKey();

    const payload = {
      username: consumerName,
      plugins: {
        "key-auth": {
          key,
        },
      },
    };

    try {
      const res = await fetch(
        `${API_URL}/apisix/admin/consumers/${consumerName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ADMIN,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to create consumer");

      setApiKey(key);
      setMessage(`API Key successfully generated for "${consumerName}"`);
    } catch (err) {
      console.error("Consumer create error:", err);
      setMessage("Failed to generate API key.");
    }
  };

  return (
    <div className="bg-white text-black p-4 rounded shadow mt-6">
      <h2 className="text-lg font-bold mb-2">Generate API Key</h2>

      <input
        type="text"
        placeholder="Consumer Name"
        value={consumerName}
        onChange={(e) => setConsumerName(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />

      <button
        onClick={handleGenerate}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Generate Key
      </button>

      {message && <p className="mt-3">{message}</p>}
      {apiKey && (
        <div className="mt-2">
          <strong>Generated API Key:</strong>
          <div className="bg-gray-100 text-sm p-2 rounded break-all mt-1">
            {apiKey}
          </div>
        </div>
      )}
    </div>
  );
}
