export default function LoadingSpinner({ fullScreen = false, size = "md" }) {
  const sizes = { sm: "w-7 h-7", md: "w-10 h-10", lg: "w-14 h-14" };

  const spinner = (
    <div
      className={`${sizes[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
