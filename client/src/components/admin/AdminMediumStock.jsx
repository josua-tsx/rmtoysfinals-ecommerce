export default function AdminMediumStock({ stock }) {
  return (
    <div className="bg-white border border-black p-4 flex flex-col items-center justify-center gap-2 rounded-[5px] relative overflow-hidden group hover:-translate-y-1 transition-transform">
      {/* Background glow */}
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl"></div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-3 right-3 w-4 h-4 bg-orange-400 border border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>

      <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
        Medium Stock
      </span>
      <span className="text-3xl font-black text-black">
        {stock ? stock.length : 0}
      </span>
      <span className="text-[10px] uppercase font-bold text-gray-500">
        Products
      </span>
    </div>
  );
}
