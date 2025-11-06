export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      <span className="ml-3 text-lg">Memuat...</span>
    </div>
  );
}
