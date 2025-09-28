import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { ethers } from 'ethers';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

// Contract ABI - this should be replaced with the actual generated ABI
const CONTRACT_ABI = parseAbi([
  'function mintCard(string memory cardName, string memory imageURI, externalEuint32 level, externalEuint32 hp, externalEuint32 attack, externalEuint32 defense, externalEaddress encryptedTo, bytes calldata inputProof) external returns (uint256)',
  'function transfer(uint256 tokenId, address to, externalEaddress encryptedCurrentOwner, externalEaddress encryptedTo, bytes calldata inputProof) external',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'function getCard(uint256 tokenId) external view returns (string memory cardName, string memory imageURI, euint32 level, euint32 hp, euint32 attack, euint32 defense, eaddress encryptedOwner)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function approve(address to, uint256 tokenId) external',
  'function getApproved(uint256 tokenId) external view returns (address)',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)'
]);

// Replace with actual deployed contract address
const CONTRACT_ADDRESS = '0x...'; // This will be updated after deployment

interface Card {
  id: number;
  name: string;
  imageURI: string;
  level?: number;
  hp?: number;
  attack?: number;
  defense?: number;
  owner: string;
}

interface MintFormData {
  name: string;
  imageURI: string;
  level: string;
  hp: string;
  attack: string;
  defense: string;
}

export function PokemonCards() {
  const { address, isConnected } = useAccount();
  const [cards, setCards] = useState<Card[]>([]);
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [mintForm, setMintForm] = useState<MintFormData>({
    name: '',
    imageURI: '',
    level: '',
    hp: '',
    attack: '',
    defense: ''
  });

  const [transferForm, setTransferForm] = useState({
    tokenId: '',
    toAddress: ''
  });

  const { writeContract } = useWriteContract();

  const { data: totalSupply } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'totalSupply',
  });

  const { data: userBalance } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Initialize FHEVM instance
  useEffect(() => {
    const initFHEVM = async () => {
      try {
        if (window.ethereum) {
          const config = { ...SepoliaConfig, network: window.ethereum };
          const instance = await createInstance(config);
          setFhevmInstance(instance);
        }
      } catch (err) {
        console.error('Failed to initialize FHEVM:', err);
        setError('Failed to initialize encryption system');
      }
    };

    initFHEVM();
  }, []);

  // Load cards
  useEffect(() => {
    if (isConnected && totalSupply && fhevmInstance) {
      loadCards();
    }
  }, [isConnected, totalSupply, fhevmInstance]);

  const loadCards = async () => {
    if (!totalSupply || !fhevmInstance) return;

    try {
      setIsLoading(true);
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      });

      const loadedCards: Card[] = [];

      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const cardData = await publicClient.readContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getCard',
            args: [BigInt(i)]
          });

          const owner = await publicClient.readContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'ownerOf',
            args: [BigInt(i)]
          });

          let decryptedStats = {};

          // Try to decrypt stats if user is the owner
          if (address && owner.toLowerCase() === address.toLowerCase()) {
            try {
              const decryptedLevel = await fhevmInstance.userDecryptEuint(
                fhevmInstance.FhevmType.euint32,
                cardData[2], // level
                CONTRACT_ADDRESS,
                { address }
              );

              const decryptedHp = await fhevmInstance.userDecryptEuint(
                fhevmInstance.FhevmType.euint32,
                cardData[3], // hp
                CONTRACT_ADDRESS,
                { address }
              );

              const decryptedAttack = await fhevmInstance.userDecryptEuint(
                fhevmInstance.FhevmType.euint32,
                cardData[4], // attack
                CONTRACT_ADDRESS,
                { address }
              );

              const decryptedDefense = await fhevmInstance.userDecryptEuint(
                fhevmInstance.FhevmType.euint32,
                cardData[5], // defense
                CONTRACT_ADDRESS,
                { address }
              );

              decryptedStats = {
                level: Number(decryptedLevel),
                hp: Number(decryptedHp),
                attack: Number(decryptedAttack),
                defense: Number(decryptedDefense)
              };
            } catch (err) {
              console.log('Could not decrypt stats for card', i);
            }
          }

          loadedCards.push({
            id: i,
            name: cardData[0] as string,
            imageURI: cardData[1] as string,
            owner: owner as string,
            ...decryptedStats
          });
        } catch (err) {
          console.error(`Error loading card ${i}:`, err);
        }
      }

      setCards(loadedCards);
    } catch (err) {
      console.error('Error loading cards:', err);
      setError('Failed to load cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintCard = async () => {
    if (!isConnected || !fhevmInstance || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!mintForm.name || !mintForm.imageURI || !mintForm.level || !mintForm.hp || !mintForm.attack || !mintForm.defense) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Create encrypted input
      const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add32(Number(mintForm.level));
      input.add32(Number(mintForm.hp));
      input.add32(Number(mintForm.attack));
      input.add32(Number(mintForm.defense));
      input.addAddress(address);
      const encryptedInput = await input.encrypt();

      // Call mint function
      await writeContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'mintCard',
        args: [
          mintForm.name,
          mintForm.imageURI,
          encryptedInput.handles[0], // level
          encryptedInput.handles[1], // hp
          encryptedInput.handles[2], // attack
          encryptedInput.handles[3], // defense
          encryptedInput.handles[4], // encrypted owner
          encryptedInput.inputProof,
        ],
      });

      setSuccess('Card minted successfully!');
      setMintForm({
        name: '',
        imageURI: '',
        level: '',
        hp: '',
        attack: '',
        defense: ''
      });

      // Reload cards after a delay
      setTimeout(() => {
        loadCards();
      }, 2000);
    } catch (err) {
      console.error('Error minting card:', err);
      setError('Failed to mint card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!isConnected || !fhevmInstance || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!transferForm.tokenId || !transferForm.toAddress) {
      setError('Please fill in all transfer fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Create encrypted input for transfer
      const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.addAddress(address); // current owner
      input.addAddress(transferForm.toAddress); // new owner
      const encryptedInput = await input.encrypt();

      // Call transfer function
      await writeContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'transfer',
        args: [
          BigInt(transferForm.tokenId),
          transferForm.toAddress as `0x${string}`,
          encryptedInput.handles[0], // encrypted current owner
          encryptedInput.handles[1], // encrypted new owner
          encryptedInput.inputProof,
        ],
      });

      setSuccess('Card transferred successfully!');
      setTransferForm({ tokenId: '', toAddress: '' });

      // Reload cards after a delay
      setTimeout(() => {
        loadCards();
      }, 2000);
    } catch (err) {
      console.error('Error transferring card:', err);
      setError('Failed to transfer card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container">
        <div className="header">
          <h1 className="title">RWA Pokemon Cards</h1>
          <ConnectButton />
        </div>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Please connect your wallet to continue</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1 className="title">RWA Pokemon Cards</h1>
        <div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Your Balance: {userBalance ? Number(userBalance) : 0} cards</strong>
          </div>
          <ConnectButton />
        </div>
      </div>

      {error && <div className="error">Error: {error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Mint Form */}
      <div className="mint-form">
        <h2 className="form-title">Mint New Pokemon Card</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Card Name</label>
            <input
              type="text"
              className="form-input"
              value={mintForm.name}
              onChange={(e) => setMintForm({ ...mintForm, name: e.target.value })}
              placeholder="e.g., Pikachu"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image URI</label>
            <input
              type="url"
              className="form-input"
              value={mintForm.imageURI}
              onChange={(e) => setMintForm({ ...mintForm, imageURI: e.target.value })}
              placeholder="https://example.com/image.png"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Level</label>
            <input
              type="number"
              className="form-input"
              value={mintForm.level}
              onChange={(e) => setMintForm({ ...mintForm, level: e.target.value })}
              placeholder="50"
            />
          </div>
          <div className="form-group">
            <label className="form-label">HP</label>
            <input
              type="number"
              className="form-input"
              value={mintForm.hp}
              onChange={(e) => setMintForm({ ...mintForm, hp: e.target.value })}
              placeholder="120"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Attack</label>
            <input
              type="number"
              className="form-input"
              value={mintForm.attack}
              onChange={(e) => setMintForm({ ...mintForm, attack: e.target.value })}
              placeholder="80"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Defense</label>
            <input
              type="number"
              className="form-input"
              value={mintForm.defense}
              onChange={(e) => setMintForm({ ...mintForm, defense: e.target.value })}
              placeholder="60"
            />
          </div>
        </div>
        <button
          className={`mint-button ${isLoading ? 'loading' : ''}`}
          onClick={handleMintCard}
          disabled={isLoading}
        >
          {isLoading ? 'Minting...' : 'Mint Card'}
        </button>
      </div>

      {/* Transfer Form */}
      <div className="transfer-section">
        <h2 className="form-title">Transfer Card</h2>
        <div className="transfer-form">
          <div className="form-group">
            <label className="form-label">Token ID</label>
            <input
              type="number"
              className="form-input"
              value={transferForm.tokenId}
              onChange={(e) => setTransferForm({ ...transferForm, tokenId: e.target.value })}
              placeholder="1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">To Address</label>
            <input
              type="text"
              className="form-input"
              value={transferForm.toAddress}
              onChange={(e) => setTransferForm({ ...transferForm, toAddress: e.target.value })}
              placeholder="0x..."
            />
          </div>
          <button
            className={`mint-button ${isLoading ? 'loading' : ''}`}
            onClick={handleTransfer}
            disabled={isLoading}
            style={{ height: 'fit-content' }}
          >
            {isLoading ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      </div>

      {/* Cards Display */}
      <div>
        <h2>All Cards ({cards.length})</h2>
        {isLoading && <div>Loading cards...</div>}
        <div className="cards-grid">
          {cards.map((card) => (
            <div key={card.id} className="card-item">
              <div className="card-name">{card.name}</div>
              <img
                src={card.imageURI}
                alt={card.name}
                className="card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
                }}
              />
              <div>
                <strong>Owner:</strong> {card.owner === address ? 'You' : `${card.owner.slice(0, 6)}...${card.owner.slice(-4)}`}
              </div>
              {card.level !== undefined && (
                <div className="card-stats">
                  <div className="stat">
                    <span>Level:</span>
                    <span>{card.level}</span>
                  </div>
                  <div className="stat">
                    <span>HP:</span>
                    <span>{card.hp}</span>
                  </div>
                  <div className="stat">
                    <span>Attack:</span>
                    <span>{card.attack}</span>
                  </div>
                  <div className="stat">
                    <span>Defense:</span>
                    <span>{card.defense}</span>
                  </div>
                </div>
              )}
              {card.owner === address && card.level === undefined && (
                <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px' }}>
                  Stats are encrypted. Only you can see them.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}