import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { Contract } from 'ethers';
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

  const [name, setName] = useState('');
  const [imageURI, setImageURI] = useState('');
  const [level, setLevel] = useState('1');
  const [hp, setHp] = useState('50');
  const [attack, setAttack] = useState('10');
  const [defense, setDefense] = useState('5');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const onMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance || !address || !signerPromise) {
      alert('Connect wallet and wait for Zama SDK');
      return;
    }
    try {
      setSubmitting(true);
      setTxHash('');
      // Prepare encrypted inputs: level, hp, attack, defense, encryptedTo (recipient = minter)
      const buf = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      buf.add32(parseInt(level));
      buf.add32(parseInt(hp));
      buf.add32(parseInt(attack));
      buf.add32(parseInt(defense));
      buf.addAddress(address);
      const enc = await buf.encrypt();

      const signer = await signerPromise;
      const c = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await c.mintCard(
        name,
        imageURI,
        enc.handles[0], // level
        enc.handles[1], // hp
        enc.handles[2], // attack
        enc.handles[3], // defense
        enc.handles[4], // encryptedTo
        enc.inputProof
      );
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
        <label>Name<input value={name} onChange={e=>setName(e.target.value)} required/></label>
        <label>Image URI<input value={imageURI} onChange={e=>setImageURI(e.target.value)} required/></label>
        <div className="grid2">
          <label>Level<input type="number" value={level} onChange={e=>setLevel(e.target.value)} min={0} required/></label>
          <label>HP<input type="number" value={hp} onChange={e=>setHp(e.target.value)} min={0} required/></label>
          <label>Attack<input type="number" value={attack} onChange={e=>setAttack(e.target.value)} min={0} required/></label>
          <label>Defense<input type="number" value={defense} onChange={e=>setDefense(e.target.value)} min={0} required/></label>
        </div>
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

  const { data: card } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCard',
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
      {card && (
        <div className="card-view">
          <div className="meta">
            <p><strong>Name:</strong> {card[0] as string}</p>
            <p><strong>Owner:</strong> {owner as string}</p>
          </div>
          {(card[1] as string) && (
            <img src={card[1] as string} alt="card" className="preview"/>
          )}
          <div className="meta">
            <p>Level: ***</p>
            <p>HP: ***</p>
            <p>Attack: ***</p>
            <p>Defense: ***</p>
            <p>Encrypted Owner: {(card[6] as string).slice(0,20)}...</p>
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

