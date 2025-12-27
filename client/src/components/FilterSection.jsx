export default function FilterSection({ title, children }) {
  return (
    <div className="flex-col gap-2 pb-5 border-t-2 border-black pt-5">
      <div className="flex items-start justify-between">
        <h1 className="font-black uppercase tracking-widest text-sm  mb-2 bg-primary text-white px-2 py-1 rounded-[5px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {title}
        </h1>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
