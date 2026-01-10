import '../styles/Loader.css';

const Loader = ({ message = 'Đang xử lý...' }) => {
  return (
    <div className="fixed inset-0 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="flex flex-col items-center gap-8">
        {/* 3D Boxes Loader */}
        <div className="boxes">
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mt-16">
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{message}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
