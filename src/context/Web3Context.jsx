import { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { VOTING_ADDRESS, SEPOLIA_CHAIN_ID } from '../utils/constants';
import { VOTING_ABI } from '../utils/abis';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState({
    claimStart: 0,
    claimEnd: 0,
    voteStart: 0,
    voteEnd: 0,
  });
  const [saleActive, setSaleActive] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);
  const [hideCandidates, setHideCandidates] = useState(false);

  const loadSchedule = useCallback(async (contract) => {
    try {
      const lt = await contract.lichTrinh();
      setSchedule({
        claimStart: Number(lt.claimStart) * 1000,
        claimEnd: Number(lt.claimEnd) * 1000,
        voteStart: Number(lt.voteStart) * 1000,
        voteEnd: Number(lt.voteEnd) * 1000,
      });
    } catch (e) {
      console.warn('Không load được lịch trình', e);
    }
  }, []);

  const loadStatus = useCallback(async (contract) => {
    try {
      const [sale, vote] = await Promise.all([
        contract.saleActive(),
        contract.moBauChon(),
      ]);
      setSaleActive(sale);
      setVoteOpen(vote);
    } catch (e) {
      console.warn('Không load được trạng thái', e);
    }
  }, []);

  const saveSchedule = async (input) => {
    if (!votingContract) return;
    try {
      setIsLoading(true);
      const cs = Math.floor(new Date(input.claimStart).getTime() / 1000);
      const ce = Math.floor(new Date(input.claimEnd).getTime() / 1000);
      const vs = Math.floor(new Date(input.voteStart).getTime() / 1000);
      const ve = Math.floor(new Date(input.voteEnd).getTime() / 1000);
      const tx = await votingContract.capNhatLichTrinh(cs, ce, vs, ve);
      await tx.wait();
      await loadSchedule(votingContract);
      alert('Đã lưu lịch trình!');
    } catch (e) {
      alert(e.message || 'Lỗi lưu lịch trình');
    }
    setIsLoading(false);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Vui lòng cài đặt MetaMask!');
      return;
    }
    try {
      setIsLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          }
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

      setCurrentAccount(accounts[0]);
      setVotingContract(contract);

      // Track visitor (người tham gia)
      try {
        await fetch(`${API_BASE}/track-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: accounts[0] }),
        });
      } catch (e) {
        console.warn('Track visitor error:', e);
      }

      // Bind email to wallet (phát hiện gian lận)
      const email = localStorage.getItem('qnu-email-verified');
      if (email) {
        try {
          const bindRes = await fetch(`${API_BASE}/wallet/bind`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, wallet: accounts[0] }),
          });
          if (!bindRes.ok) {
            const bindData = await bindRes.json();
            if (bindRes.status === 409) {
              // Email đã được bind với ví khác - GIAN LẬN
              alert(`PHÁT HIỆN GIAN LẬN!\n\n${bindData.error}\n\nMỗi email chỉ được sử dụng với 1 ví duy nhất.\nVui lòng sử dụng đúng ví đã đăng ký hoặc liên hệ ban tổ chức.`);
              // Disconnect wallet
              setCurrentAccount(null);
              setVotingContract(null);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Bind wallet error:', e);
        }
      }

      // Check admin
      try {
        const adminRole = await contract.ADMIN_ROLE();
        const hasAdmin = await contract.hasRole(adminRole, accounts[0]);
        setIsAdmin(hasAdmin);
      } catch {
        setIsAdmin(false);
      }

      await loadSchedule(contract);
      await loadStatus(contract);
    } catch (e) {
      console.error('Connect wallet error:', e);
      alert(e.message || 'Không thể kết nối ví');
    }
    setIsLoading(false);
  };

  const disconnectWallet = () => {
    setCurrentAccount(null);
    setVotingContract(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Auto-connect if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          connectWallet();
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        currentAccount,
        votingContract,
        isAdmin,
        isLoading,
        setIsLoading,
        schedule,
        saveSchedule,
        saleActive,
        voteOpen,
        hideCandidates,
        setHideCandidates,
        connectWallet,
        disconnectWallet,
        loadSchedule,
        loadStatus,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
