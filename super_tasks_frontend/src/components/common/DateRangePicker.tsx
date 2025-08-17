export default function DateRangePicker(props: {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
}) {
  const { from, to, onChange } = props;
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-sm">From</label>
        <input
          type="date"
          className="border rounded p-2 w-full"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
        />
      </div>
      <div>
        <label className="block text-sm">To</label>
        <input
          type="date"
          className="border rounded p-2 w-full"
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
        />
      </div>
    </div>
  );
}
