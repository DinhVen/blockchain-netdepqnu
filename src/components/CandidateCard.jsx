import React, { useState } from 'react';
import CandidateDetailModal from './CandidateDetailModal';

const CandidateCard = ({ candidate, onVote, isVoting }) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="group relative animate-scaleIn">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
        {/* Image Container */}
        <div 
          className="relative h-72 overflow-hidden cursor-pointer"
          onClick={() => setShowDetail(true)}
        >
          <img
            src={candidate.imageHash || candidate.image || 'https://via.placeholder.com/300x400'}
            alt={candidate.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          {/* Info Badge */}
          <div className="absolute top-4 left-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(true);
              }}
              className="inline-flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Công nghệ thông tin
            </button>
          </div>

          {/* Major Badge */}
          {candidate.major && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                {candidate.major}
              </span>
            </div>
          )}
          
          {/* Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-2xl font-black text-white mb-1 drop-shadow-lg">{candidate.name}</h3>
            <p className="text-sm text-white/90 font-medium">MSSV: {candidate.mssv}</p>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between mb-4">
            {/* Vote Count */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lượt bầu chọn</p>
                <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {(candidate.votes ?? 0).toString()}
                </p>
              </div>
            </div>
          </div>

          {/* Vote Button */}
          <button
            onClick={() => onVote(candidate.id)}
            disabled={isVoting}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 transform ${
              isVoting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl shadow-lg'
            }`}
          >
            {isVoting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Bầu chọn ngay
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <CandidateDetailModal 
        candidate={candidate}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
};
export default CandidateCard;
