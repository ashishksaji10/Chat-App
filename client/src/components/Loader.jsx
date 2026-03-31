const Loader = () => {
  return (
    <div className="fixed inset-0 bg-[#e74c3c]/70 z-9999 flex items-center justify-center backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
