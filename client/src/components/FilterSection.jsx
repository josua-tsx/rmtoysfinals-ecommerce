

export default function FilterSection({title,children}) {
  return (
    <div className={` flex-col gap-2  pb-5`}>
      <div className="flex items-start justify-between">
        <h1 className="text-xl mb-2">{title}</h1>
       
      </div>

      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
