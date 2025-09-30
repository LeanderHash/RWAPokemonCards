// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, eaddress, externalEuint32, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title RWA Pokemon Cards (confidential attributes + encrypted owner)
/// @notice Minimal ERC721-like NFT with encrypted attributes and encrypted owner using Zama FHEVM
contract RWAPokemonCards is SepoliaConfig {
    // --------------------
    // Errors
    // --------------------
    error InvalidTokenId();
    error NotApprovedOrOwner();
    error TransferToZeroAddress();
    error UnauthorizedTransfer();

    // --------------------
    // Events
    // --------------------
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event CardMinted(uint256 indexed tokenId, string name, address indexed to);

    // --------------------
    // Storage
    // --------------------
    struct Card {
        string cardName;
        string imageURI;
        euint32 level;
        euint32 hp;
        euint32 attack;
        euint32 defense;
        eaddress encryptedOwner; // encrypted owner address
    }

    uint256 private _totalSupply;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => Card) private _cards;

    // --------------------
    // View metadata (constant strings to match ABI "pure")
    // --------------------
    function name() public pure returns (string memory) {
        return "RWA Pokemon Cards";
    }

    function symbol() public pure returns (string memory) {
        return "RWAPC";
    }

    // --------------------
    // ERC721 minimal
    // --------------------
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "zero address");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) revert InvalidTokenId();
        return owner;
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        if (msg.sender != owner && !isApprovedForAll(owner, msg.sender)) revert NotApprovedOrOwner();
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (to == address(0)) revert TransferToZeroAddress();
        address owner = ownerOf(tokenId);
        if (owner != from) revert InvalidTokenId();
        if (
            msg.sender != owner &&
            msg.sender != getApproved(tokenId) &&
            !isApprovedForAll(owner, msg.sender)
        ) {
            revert NotApprovedOrOwner();
        }
        _transfer(from, to, tokenId);
    }

    // --------------------
    // Confidential card logic
    // --------------------
    function getCard(uint256 tokenId)
        public
        view
        returns (
            string memory cardName,
            string memory imageURI,
            euint32 level,
            euint32 hp,
            euint32 attack,
            euint32 defense,
            eaddress encryptedOwner
        )
    {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        Card storage c = _cards[tokenId];
        return (c.cardName, c.imageURI, c.level, c.hp, c.attack, c.defense, c.encryptedOwner);
    }

    function getEncryptedOwner(uint256 tokenId) public view returns (eaddress) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return _cards[tokenId].encryptedOwner;
    }

    // Mint to msg.sender, but set encrypted owner to provided encryptedTo
    function mintCard(
        string memory cardName_,
        string memory imageURI_,
        externalEuint32 level,
        externalEuint32 hp,
        externalEuint32 attack,
        externalEuint32 defense,
        externalEaddress encryptedTo,
        bytes calldata inputProof
    ) public returns (uint256) {
        // Import encrypted values
        euint32 levelEnc = FHE.fromExternal(level, inputProof);
        euint32 hpEnc = FHE.fromExternal(hp, inputProof);
        euint32 attackEnc = FHE.fromExternal(attack, inputProof);
        euint32 defenseEnc = FHE.fromExternal(defense, inputProof);
        eaddress toEnc = FHE.fromExternal(encryptedTo, inputProof);

        // Book-keeping
        _totalSupply += 1;
        uint256 tokenId = _totalSupply;
        _owners[tokenId] = msg.sender;
        _balances[msg.sender] += 1;

        // Save card
        _cards[tokenId] = Card({
            cardName: cardName_,
            imageURI: imageURI_,
            level: levelEnc,
            hp: hpEnc,
            attack: attackEnc,
            defense: defenseEnc,
            encryptedOwner: toEnc
        });

        // ACL: allow contract and recipient to access fields as needed
        FHE.allowThis(levelEnc);
        FHE.allowThis(hpEnc);
        FHE.allowThis(attackEnc);
        FHE.allowThis(defenseEnc);
        FHE.allowThis(toEnc);
        FHE.allow(toEnc, msg.sender);

        emit Transfer(address(0), msg.sender, tokenId);
        emit CardMinted(tokenId, cardName_, msg.sender);
        return tokenId;
    }

    // Anyone can call if they can provide a valid encrypted current owner (through ACL) and a new encrypted "to".
    function transfer(
        uint256 tokenId,
        address to,
        externalEaddress encryptedCurrentOwner,
        externalEaddress encryptedTo,
        bytes calldata inputProof
    ) public {
        if (to == address(0)) revert TransferToZeroAddress();
        address owner = ownerOf(tokenId);

        // Import encrypted owner values
        eaddress currOwnerEnc = FHE.fromExternal(encryptedCurrentOwner, inputProof);
        eaddress toEnc = FHE.fromExternal(encryptedTo, inputProof);

        // Check that sender is allowed to use the stored encrypted owner and the provided encryptedCurrentOwner.
        // This effectively ties the call to the current owner registered in ACL.
        if (!FHE.isSenderAllowed(_cards[tokenId].encryptedOwner)) {
            revert UnauthorizedTransfer();
        }
        if (!FHE.isSenderAllowed(currOwnerEnc)) {
            revert UnauthorizedTransfer();
        }

        // Optional: compute encrypted equality, and make sure the contract can later publicly decrypt if needed
        // for off-chain verification flows. On-chain branching on ebool is not supported synchronously.
        FHE.allowThis(currOwnerEnc);
        FHE.allowThis(_cards[tokenId].encryptedOwner);

        // Clear approvals
        _approve(address(0), tokenId, owner);

        // Update on-chain visible owner and balances
        _transfer(owner, to, tokenId);

        // Update encrypted owner to encrypted "to"
        _cards[tokenId].encryptedOwner = toEnc;
        FHE.allowThis(toEnc);
        FHE.allow(toEnc, to);
    }

    // --------------------
    // Internal helpers
    // --------------------
    function _transfer(address from, address to, uint256 tokenId) internal {
        if (to == address(0)) revert TransferToZeroAddress();
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function _approve(address to, uint256 tokenId, address owner) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }
}

