// components/LoadingSpinner.js

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-300 border-solid rounded-full animate-spin border-t-indigo-600"></div>
    </div>
  );
}
