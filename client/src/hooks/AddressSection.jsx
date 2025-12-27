export default function AddressSection({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-black uppercase text-xs tracking-wider text-gray-500">
        {title}
      </h1>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
