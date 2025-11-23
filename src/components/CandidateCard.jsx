import React from 'react';

const CandidateCard = ({ candidate, onVote, isVoting }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 animate-scaleIn group">
      <div className="h-64 overflow-hidden relative">
        <img
          src={candidate.imageHash || candidate.image || 'https://via.placeholder.com/300x400'}
          alt={candidate.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{candidate.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">MSSV: {candidate.mssv}</p>
          </div>
          {candidate.major && (
            <span className="bg-blue-100 dark:bg-blue-900/50 text-qnu-500 dark:text-blue-400 text-xs font-semibold px-2 py-1 rounded animate-pulse-slow">
              {candidate.major}
            </span>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">Lượt bầu chọn</p>
            <p className="text-2xl font-bold text-qnu-500 dark:text-blue-400">{(candidate.votes ?? 0).toString()}</p>
          </div>
          <button
            onClick={() => onVote(candidate.id)}
            disabled={isVoting}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 transform ${
              isVoting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-qnu-500 hover:bg-qnu-600 dark:bg-blue-600 dark:hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {isVoting ? 'Đang xử lý...' : 'Bầu chọn'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CandidateCard;
