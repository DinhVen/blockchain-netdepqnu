// Script để thêm vote history mẫu cho các vote đã có
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qnu_voting';

const VoteHistorySchema = new mongoose.Schema(
  {
    candidateId: { type: Number, index: true },
    name: String,
    mssv: String,
    wallet: { type: String, index: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const VoteHistoryModel = mongoose.model('vote_history', VoteHistorySchema);

async function addSampleVoteHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Thêm vote history mẫu cho ứng viên ID 1
    // Anh có thể thay đổi thông tin này
    const sampleVote = {
      candidateId: 1,
      name: 'Nguyễn Tiên', // Thay bằng tên anh
      mssv: '46510502', // Thay bằng MSSV anh
      wallet: '0x...', // Thay bằng địa chỉ ví anh đã vote
      timestamp: new Date(),
    };

    const result = await VoteHistoryModel.create(sampleVote);
    console.log('✅ Đã thêm vote history mẫu:', result);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleVoteHistory();
