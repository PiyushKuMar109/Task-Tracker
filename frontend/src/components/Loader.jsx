export default function Loader() {

  return (
    <div className="h-screen flex items-center justify-center bg-[#f9fafb]">

      <div className="flex flex-col items-center gap-4">

        <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#5a4bcc] rounded-full animate-spin" />

        <p className="text-[#666] text-[12px] mono">
          Loading...
        </p>

      </div>

    </div>
  );
}