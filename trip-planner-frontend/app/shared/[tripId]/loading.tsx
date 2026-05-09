export default function SharedTripLoading() {
  return <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-32"/>)}</div>;
}
