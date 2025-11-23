const Loader = ({ message = 'Đang xử lý...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-qnu-500 border-t-transparent"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
