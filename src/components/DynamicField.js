function DynamicField({ field, value, onChange }) {
  const { key, label, type, options, required } = field;

  if (type === 'select') {
    return (
      <select value={value || ''} onChange={(e) => onChange(key, e.target.value)} required={required}>
        <option value="">{label}{required ? ' *' : ''}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (type === 'boolean') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 0' }}>
        <input
          type="checkbox"
          checked={value === true || value === 'true'}
          onChange={(e) => onChange(key, e.target.checked)}
        />
        {label}
      </label>
    );
  }

  if (type === 'number') {
    return (
      <input
        type="number"
        placeholder={label + (required ? ' *' : '')}
        value={value || ''}
        onChange={(e) => onChange(key, e.target.value)}
        required={required}
      />
    );
  }

  // default: text
  return (
    <input
      type="text"
      placeholder={label + (required ? ' *' : '')}
      value={value || ''}
      onChange={(e) => onChange(key, e.target.value)}
      required={required}
    />
  );
}

export default DynamicField;
