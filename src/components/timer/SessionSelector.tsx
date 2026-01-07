import type { Session } from "../../types/session";

type Props = {
  sessions: Session[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export default function SessionSelector({
  sessions,
  activeId,
  onSelect,
  onCreate,
}: Props) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <select
        value={activeId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-gray-800 text-white px-2 py-1 rounded"
      >
        <option value="">Select session</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button
        onClick={onCreate}
        className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-sm"
      >
        + New
      </button>
    </div>
  );
}
