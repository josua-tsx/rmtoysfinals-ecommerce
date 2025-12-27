export default function AdminStatCard({ title, value, value2 }) {
  return (
    <div className="bg-white border border-black rounded-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all relative mt-6">
      {/* Sticker Header */}
      <div className="absolute -top-4 -left-2 bg-indigo-600 text-white border border-black px-4 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-10">
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
          {title}
        </span>
      </div>
      <div className="px-4 py-6 flex flex-col gap-2">
        <div className="flex flex-row md:flex-col gap-1 justify-between items-baseline md:items-start mt-1">
          <p className="text-4xl font-black text-black leading-none">{value}</p>
          <p className="text-[10px] font-black uppercase text-gray-400 mt-1">
            {value2}
          </p>
        </div>
      </div>
    </div>
  );
}
