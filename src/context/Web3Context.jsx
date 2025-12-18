import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { VOTING_ADDRESS, TOKEN_ADDRESS, SEPOLIA_CHAIN_ID } from '../utils/constants';
import { VOTING_ABI, TOKEN_ABI } from '../utils/abis';

export const Web3Context = createContext();

const { ethereum } = window;
const OTP_API = import.meta.env.VITE_OTP_API || 'http://localhost:3001';

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
  const [saleActive, setSaleActive] = useState(false);
  const [refundEnabled, setRefundEnabled] = useState(false);
  const [candidateMedia, setCandidateMedia] = useState({});
  const [hideCandidates, setHideCandidates] = useState(false);
  const [blockedWallets, setBlockedWallets] = useState([]);
  const [skipAutoConnect, setSkipAutoConnect] = useState(false);

  const HIDE_KEY = 'qnu-hide-candidates';
  const BLOCK_KEY = 'qnu-wallet-blocklist';
  const DISCONNECT_KEY = 'qnu-skip-autoconnect';

  const checkWalletIsConnected = async () => {
    if (!ethereum) return alert('Vui long cai dat Metamask!');
    if (skipAutoConnect) return;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
      initializeContracts();
    }
  };

  const connectWallet = async () => {
    if (!ethereum) return alert('Vui long cai dat Metamask!');
    try {
      setSkipAutoConnect(false);
      localStorage.removeItem(DISCONNECT_KEY);
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
      const sale = await contract.saleActive();
      const refund = await contract.refundEnabled();
      
      setSchedule({
        claimStart: sc.claimStart > 0 ? Number(sc.claimStart) * 1000 : null,
        claimEnd: sc.claimEnd > 0 ? Number(sc.claimEnd) * 1000 : null,
        voteStart: sc.voteStart > 0 ? Number(sc.voteStart) * 1000 : null,
        voteEnd: sc.voteEnd > 0 ? Number(sc.voteEnd) * 1000 : null,
      });
      setSaleActive(sale);
      setRefundEnabled(refund);
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
    setSkipAutoConnect(true);
    try {
      localStorage.setItem(DISCONNECT_KEY, 'true');
    } catch (e) {
      console.warn('Khong luu duoc flag skip autoconnect', e);
    }
    try {
      localStorage.removeItem('qnu-email-verified');
      localStorage.removeItem('qnu-email-token');
      localStorage.removeItem('qnu-email-wallet');
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

  const bindEmailWallet = async (account) => {
    const email = localStorage.getItem('qnu-email-verified');
    const token = localStorage.getItem('qnu-email-token');
    if (!email || !token || !account) return;

    const existing = localStorage.getItem('qnu-email-wallet');
    if (existing && existing.toLowerCase() === account.toLowerCase()) return;

    try {
      const res = await fetch(`${OTP_API}/wallet/bind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, wallet: account }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'Email đã gắn với ví khác. Liên hệ admin để hỗ trợ.');
        return;
      }
      localStorage.setItem('qnu-email-wallet', account);
    } catch (e) {
      console.warn('Bind email-wallet failed', e);
    }
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
    let skipFlag = false;
    try {
      const flag = localStorage.getItem(DISCONNECT_KEY);
      if (flag === 'true') {
        skipFlag = true;
        setSkipAutoConnect(true);
      }
    } catch (e) {
      console.warn('Khong doc duoc flag disconnect', e);
    }

    if (!skipFlag) {
      checkWalletIsConnected();
    }

    if (ethereum) {
      ethereum.on('chainChanged', () => window.location.reload());
      ethereum.on('accountsChanged', (accounts) => {
        if (accounts && accounts.length) {
          setCurrentAccount(accounts[0]);
          initializeContracts();
        } else {
          setCurrentAccount('');
          setVotingContract(null);
          setTokenContract(null);
          setIsAdmin(false);
        }
      });
    }

    const savedMedia = localStorage.getItem('qnu-candidate-media');
    if (savedMedia) setCandidateMedia(JSON.parse(savedMedia));

    const savedHide = localStorage.getItem(HIDE_KEY);
    if (savedHide === 'true' || savedHide === 'false') {
      setHideCandidates(savedHide === 'true');
    } else if (import.meta.env.VITE_HIDE_CANDIDATES === 'true') {
      setHideCandidates(true);
    }

    const savedBlocklist = localStorage.getItem(BLOCK_KEY);
    if (savedBlocklist) {
      try {
        const parsed = JSON.parse(savedBlocklist);
        if (Array.isArray(parsed)) setBlockedWallets(parsed);
      } catch (e) {
        console.warn('Khong parse duoc blocklist', e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentAccount) {
      bindEmailWallet(currentAccount);
    }
  }, [currentAccount]);

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

  const isBlocked = currentAccount
    ? blockedWallets.some((w) => w.toLowerCase() === currentAccount.toLowerCase())
    : false;

  const persistBlocklist = (next) => {
    setBlockedWallets(next);
    try {
      localStorage.setItem(BLOCK_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Khong luu duoc blocklist', e);
    }
  };

  const blockWallet = (addr) => {
    if (!isAdmin || !addr) return;
    const normalized = addr.toLowerCase();
    if (blockedWallets.some((w) => w.toLowerCase() === normalized)) return;
    persistBlocklist([...blockedWallets, normalized]);
  };

  const unblockWallet = (addr) => {
    if (!isAdmin || !addr) return;
    const normalized = addr.toLowerCase();
    const next = blockedWallets.filter((w) => w.toLowerCase() !== normalized);
    persistBlocklist(next);
  };

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
      saleActive,
      refundEnabled,
      candidateMedia,
      upsertCandidateImage,
      removeCandidateImage,
      isLoading,
      setIsLoading,
      hideCandidates,
      setHideCandidates: (next) => {
        if (!isAdmin) return;
        const value = Boolean(next);
        setHideCandidates(value);
        localStorage.setItem(HIDE_KEY, value ? 'true' : 'false');
      },
      blockedWallets,
      isBlocked,
      blockWallet,
      unblockWallet,
    }}>
      {children}
    </Web3Context.Provider>
  );
};
