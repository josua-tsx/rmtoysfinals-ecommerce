export default function AdminHeader({ title }) {
  return (
    <header className="bg-card p-6 px-8 flex justify-between items-center w-full border-b border-[#6b7280] sticky top-0 z-30">
      <h1 className="font-main font-black text-2xl uppercase text-black">
        {title}
      </h1>
      <div className="flex gap-4">
        <div className="size-3 bg-red-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="size-3 bg-yellow-400 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="size-3 bg-green-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
      </div>
    </header>
  );
}
