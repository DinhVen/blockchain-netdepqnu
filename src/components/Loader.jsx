const Loader = ({ message = 'Đang xử lý...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4 animate-scaleIn border border-gray-100 dark:border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-qnu-500 dark:border-blue-500 border-t-transparent"></div>
        <p className="text-gray-700 dark:text-gray-200 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
