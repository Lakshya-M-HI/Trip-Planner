export default function RegisterLoading() {
  return <div className="space-y-4">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-12 w-full"/>)}</div>;
}
