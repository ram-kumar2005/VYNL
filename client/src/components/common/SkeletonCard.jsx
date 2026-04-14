export default function SkeletonCard() {
  return (
    <div className="bg-surface2 rounded-xl p-3 animate-pulse">
      <div className="shimmer aspect-square rounded-lg mb-3" />
      <div className="shimmer h-4 rounded-md mb-2 w-4/5" />
      <div className="shimmer h-3 rounded-md w-3/5" />
      <div className="shimmer h-3 rounded-md w-1/3 mt-2" />
    </div>
  )
}
