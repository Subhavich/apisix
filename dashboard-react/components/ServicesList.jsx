import { DEFAULT_SERVICES } from "../default";
export default function DefaultServices() {
  return (
    <div>
      {DEFAULT_SERVICES.map((service, i) => (
        <div>
          <span>{service.service}</span> - <span>PORT : {service.port}</span>
        </div>
      ))}
    </div>
  );
}
