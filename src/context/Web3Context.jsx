import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { VOTING_ADDRESS, TOKEN_ADDRESS, SEPOLIA_CHAIN_ID } from '../utils/constants';
import { VOTING_ABI, TOKEN_ABI } from '../utils/abis';

export const Web3Context = createContext();

const { ethereum } = window;

export const Web3Provider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [votingContract, setVotingContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null);
  const [schedule, setSchedule] = useState({
    claimStart: null,
    claimEnd: null,
    voteStart: null,
    voteEnd: null,
  });
  const [candidateMedia, setCandidateMedia] = useState({});

  const checkWalletIsConnected = async () => {
    if (!ethereum) return alert('Vui long cai dat Metamask!');
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
      initializeContracts();
    }
  };

  const connectWallet = async () => {
    if (!ethereum) return alert('Vui long cai dat Metamask!');
    try {
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      initializeContracts();
      checkNetwork();
    } catch (error) {
      console.error(error);
      throw new Error('Khong the ket noi vi.');
    }
  };

  const checkNetwork = async () => {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId, 16) !== SEPOLIA_CHAIN_ID) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
      } catch (error) {
        alert('Vui long chuyen sang mang Sepolia de su dung!');
      }
    }
  };

  const loadSchedule = async (contract) => {
    try {
      const sc = await contract.lichTrinh();
      setSchedule({
        claimStart: sc.claimStart > 0 ? Number(sc.claimStart) * 1000 : null,
        claimEnd: sc.claimEnd > 0 ? Number(sc.claimEnd) * 1000 : null,
        voteStart: sc.voteStart > 0 ? Number(sc.voteStart) * 1000 : null,
        voteEnd: sc.voteEnd > 0 ? Number(sc.voteEnd) * 1000 : null,
      });
    } catch (e) {
      console.warn('Khong load duoc lich trinh:', e);
    }
  };

  const initializeContracts = async () => {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const vContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);
    const tContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    setVotingContract(vContract);
    setTokenContract(tContract);

    try {
      const role = await vContract.ADMIN_ROLE();
      setAdminRole(role);
      const ok = await vContract.hasRole(role, await signer.getAddress());
      setIsAdmin(ok);
    } catch (e) {
      console.warn('Khong lay duoc role admin tu contract:', e);
    }

    loadSchedule(vContract);
  };

  const logout = () => {
    setCurrentAccount('');
    setVotingContract(null);
    setTokenContract(null);
    setIsAdmin(false);
    try {
      localStorage.removeItem('qnu-email-verified');
      localStorage.removeItem('qnu-email-token');
    } catch (e) {
      console.warn('Khong xoa duoc flag email:', e);
    }
    window.location.href = '/';
  };

  const saveSchedule = async (next) => {
    if (!votingContract) return;
    try {
      const ts = (val) => (val ? Math.floor(new Date(val).getTime() / 1000) : 0);
      const tx = await votingContract.capNhatLichTrinh(
        ts(next.claimStart),
        ts(next.claimEnd),
        ts(next.voteStart),
        ts(next.voteEnd)
      );
      await tx.wait();
      await loadSchedule(votingContract);
    } catch (e) {
      alert(e.message || 'Cap nhat lich that bai');
    }
  };

  const upsertCandidateImage = (id, url) => {
    if (!id) return;
    const next = { ...candidateMedia, [id]: url };
    setCandidateMedia(next);
    localStorage.setItem('qnu-candidate-media', JSON.stringify(next));
  };

  const removeCandidateImage = (id) => {
    const next = { ...candidateMedia };
    delete next[id];
    setCandidateMedia(next);
    localStorage.setItem('qnu-candidate-media', JSON.stringify(next));
  };

  useEffect(() => {
    // khi contract sẵn sàng, luôn load lại lịch để mọi user thấy
    if (votingContract) {
      loadSchedule(votingContract);
    }
  }, [votingContract]);

  useEffect(() => {
    checkWalletIsConnected();
    if (ethereum) {
      ethereum.on('chainChanged', () => window.location.reload());
      ethereum.on('accountsChanged', () => window.location.reload());
    }

    const savedMedia = localStorage.getItem('qnu-candidate-media');
    if (savedMedia) setCandidateMedia(JSON.parse(savedMedia));
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      if (!votingContract || !currentAccount) {
        setIsAdmin(false);
        return;
      }
      try {
        const role = adminRole || (await votingContract.ADMIN_ROLE());
        if (!adminRole) setAdminRole(role);
        const ok = await votingContract.hasRole(role, currentAccount);
        setIsAdmin(ok);
      } catch (e) {
        console.warn('Khong kiem tra duoc admin role:', e);
        setIsAdmin(false);
      }
    };
    checkRole();
  }, [votingContract, currentAccount, adminRole]);

  return (
    <Web3Context.Provider value={{
      connectWallet,
      currentAccount,
      votingContract,
      tokenContract,
      isAdmin,
      logout,
      schedule,
      saveSchedule,
      candidateMedia,
      upsertCandidateImage,
      removeCandidateImage,
      isLoading,
      setIsLoading
    }}>
      {children}
    </Web3Context.Provider>
  );
};
