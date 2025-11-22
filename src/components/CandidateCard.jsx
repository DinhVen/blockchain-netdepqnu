import React from 'react';

const CandidateCard = ({ candidate, onVote, isVoting }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="h-64 overflow-hidden">
        <img
          src={candidate.imageHash || candidate.image || 'https://via.placeholder.com/300x400'}
          alt={candidate.name}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
            <p className="text-sm text-gray-500">MSSV: {candidate.mssv}</p>
          </div>
          {candidate.major && (
            <span className="bg-blue-100 text-qnu-500 text-xs font-semibold px-2 py-1 rounded">
              {candidate.major}
            </span>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-center">
            <p className="text-xs text-gray-400">Lượt bầu chọn</p>
            <p className="text-2xl font-bold text-qnu-500">{(candidate.votes ?? 0).toString()}</p>
          </div>
          <button
            onClick={() => onVote(candidate.id)}
            disabled={isVoting}
            className={`px-6 py-2 rounded-lg text-white font-medium transition ${
              isVoting ? 'bg-gray-400 cursor-not-allowed' : 'bg-qnu-500 hover:bg-qnu-600'
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
