interface TodoInputProps {
  value: string;
  onChange: (val: string) => void;
  onAdd: () => void;
}

export default function TodoInput({ value, onChange, onAdd }: TodoInputProps) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 border border-[rgba(15,0,0,0.12)] bg-[#f8f7f7] rounded px-3 h-10 outline-none text-[#424245] font-mono text-base placeholder:text-[#9a9898] focus:bg-[#fdfcfc] focus:border-[#201d1d]"
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
      />
      <button
        onClick={onAdd}
        className="bg-[#201d1d] text-[#fdfcfc] rounded px-5 h-10 font-mono text-base font-medium leading-2 active:bg-[#0f0000] focus:outline-none focus:border focus:border-[#201d1d]"
      >
        [+]
      </button>
    </div>
  );
}
