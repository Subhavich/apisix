import { DEFAULT_SERVICES } from "../default";

export default function DefaultServices() {
  return (
    <div className="mt-4 p-4 shadow text-white border border-gray-200 bg-blue-500 rounded">
      <h2 className="text-lg font-bold mb-2">Default Services</h2>
      <ul className="list-disc  ">
        {DEFAULT_SERVICES.map((service, i) => (
          <li key={i} className="list-none">
            <strong>{service.service}</strong> - PORT: {service.port}
          </li>
        ))}
      </ul>
    </div>
  );
}
