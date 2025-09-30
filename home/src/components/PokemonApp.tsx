import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { Contract, isAddress } from 'ethers';
import '../styles/PokemonApp.css';

export function PokemonApp() {
  const [tab, setTab] = useState<'mint' | 'view' | 'transfer'>('mint');
  return (
    <div className="app-container">
      <div className="tabs">
        <button className={`tab ${tab==='mint'?'active':''}`} onClick={()=>setTab('mint')}>Mint</button>
        <button className={`tab ${tab==='view'?'active':''}`} onClick={()=>setTab('view')}>View</button>
        <button className={`tab ${tab==='transfer'?'active':''}`} onClick={()=>setTab('transfer')}>Transfer</button>
      </div>
      {tab==='mint' && <MintCard/>}
      {tab==='view' && <ViewCard/>}
      {tab==='transfer' && <TransferCard/>}
    </div>
  );
}

function MintCard() {
  const { address } = useAccount();
  const { instance, isLoading: zamaLoading } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [tokenUri, setTokenUri] = useState('');
  const [recipient, setRecipient] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const onMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance || !address || !signerPromise) {
      alert('Connect wallet and wait for Zama SDK');
      return;
    }
    if (!isAddress(recipient)) {
      alert('Invalid recipient address');
      return;
    }
    try {
      setSubmitting(true);
      setTxHash('');
      // Prepare encrypted input: recipient address only
      const buf = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      buf.addAddress(recipient);
      const enc = await buf.encrypt();

      const signer = await signerPromise;
      const c = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await c.mintCard(tokenUri, enc.handles[0], enc.inputProof);
      const rc = await tx.wait();
      setTxHash(rc?.hash ?? tx.hash);
    } catch (err:any) {
      console.error(err);
      alert(err?.message || 'Mint failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Mint New Card</h2>
      <form onSubmit={onMint} className="form">
        <label>Token URI<input value={tokenUri} onChange={e=>setTokenUri(e.target.value)} required/></label>
        <label>Recipient Address(Will be encrypted on chain)<input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="0x..." required/></label>
        <button disabled={submitting || zamaLoading || !address}>{submitting? 'Minting...' : 'Mint'}</button>
      </form>
      {txHash && <p className="hint">Tx: <a target="_blank" rel="noreferrer" href={`https://sepolia.etherscan.io/tx/${txHash}`}>{txHash.slice(0,10)}...</a></p>}
    </div>
  );
}

function ViewCard() {
  const [tokenId, setTokenId] = useState('1');

  const { data: total } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply'
  });

  const { data: tokenUri } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId }
  });

  const { data: encOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEncryptedOwner',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId }
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId }
  });

  return (
    <div className="card">
      <h2>View Card</h2>
      <div className="form">
        <label>Token ID<input value={tokenId} onChange={e=>setTokenId(e.target.value)} /></label>
        {typeof total !== 'undefined' && <p className="hint">Total Supply: {String(total)}</p>}
      </div>
      {(owner || tokenUri) && (
        <div className="card-view">
          <div className="meta">
            <p><strong>Owner:</strong> {owner as string}</p>
          </div>
          {(tokenUri as string) && (
            <img src={tokenUri as string} alt="card" className="preview"/>
          )}
          <div className="meta">
            <p>Encrypted Owner: ***</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TransferCard() {
  const { address } = useAccount();
  const { instance, isLoading: zamaLoading } = useZamaInstance();
  const signerPromise = useEthersSigner();
  const [tokenId, setTokenId] = useState('1');
  const [to, setTo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState('');

  const onTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !instance || !signerPromise) {
      alert('Connect wallet and wait for Zama SDK');
      return;
    }
    try {
      setSubmitting(true);
      setTxHash('');
      const buf = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      buf.addAddress(address); // current owner (caller)
      buf.addAddress(to);      // new owner
      const enc = await buf.encrypt();
      const signer = await signerPromise;
      const c = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await c.transfer(
        BigInt(tokenId),
        to,
        enc.handles[0], // encrypted current owner
        enc.handles[1], // encrypted to
        enc.inputProof
      );
      const rc = await tx.wait();
      setTxHash(rc?.hash ?? tx.hash);
    } catch (err:any) {
      console.error(err);
      alert(err?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Transfer Card</h2>
      <form onSubmit={onTransfer} className="form">
        <label>Token ID<input value={tokenId} onChange={e=>setTokenId(e.target.value)} required/></label>
        <label>To Address<input value={to} onChange={e=>setTo(e.target.value)} required/></label>
        <button disabled={submitting || zamaLoading || !address}>{submitting? 'Transferring...' : 'Transfer'}</button>
      </form>
      {txHash && <p className="hint">Tx: <a target="_blank" rel="noreferrer" href={`https://sepolia.etherscan.io/tx/${txHash}`}>{txHash.slice(0,10)}...</a></p>}
    </div>
  );
}
