export function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {label}
        {placeholder && (
          <span className="text-xs text-gray-500 ml-1">({placeholder})</span>
        )}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="border p-2 cursor-pointer"
        required={required}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {label}
        {placeholder && (
          <span className="text-xs text-gray-500 ml-1">({placeholder})</span>
        )}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border p-2 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
