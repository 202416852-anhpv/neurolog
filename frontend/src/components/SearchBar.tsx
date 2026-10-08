interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search todos..."
        className="w-full border border-[rgba(15,0,0,0.12)] bg-[#f8f7f7] rounded px-3 h-10 outline-none text-[#424245] font-mono text-base placeholder:text-[#9a9898] focus:bg-[#fdfcfc] focus:border-[#201d1d]"
      />
    </div>
  );
}
