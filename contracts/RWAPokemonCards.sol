// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import {FHE, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title RWA Pokemon Cards (encrypted owner only)
contract RWAPokemonCards is SepoliaConfig, ERC721, ERC721Enumerable, ERC721URIStorage {
    error UnauthorizedTransfer();

    // tokenId => encrypted owner
    mapping(uint256 => eaddress) private _encryptedOwner;
    uint256 private _idCounter;

    event CardMinted(uint256 indexed tokenId, string tokenURI, address indexed to);

    constructor() ERC721("RWA Pokemon Cards", "RWAPC") {}

    function getEncryptedOwner(uint256 tokenId) external view returns (eaddress) {
        _requireOwned(tokenId);
        return _encryptedOwner[tokenId];
    }

    // Mint to msg.sender, set tokenURI, and set encrypted owner to provided ciphertext
    function mintCard(
        string memory tokenUri,
        externalEaddress encryptedTo,
        bytes calldata inputProof
    ) external returns (uint256) {
        eaddress toEnc = FHE.fromExternal(encryptedTo, inputProof);

        uint256 tokenId = ++_idCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);

        _encryptedOwner[tokenId] = toEnc;
        FHE.allowThis(toEnc);
        FHE.allow(toEnc, msg.sender);

        emit CardMinted(tokenId, tokenUri, msg.sender);
        return tokenId;
    }

    // Custom confidential transfer gated by ACL
    function transfer(
        uint256 tokenId,
        address to,
        externalEaddress encryptedCurrentOwner,
        externalEaddress encryptedTo,
        bytes calldata inputProof
    ) external {
        _requireOwned(tokenId);
        if (to == address(0)) revert ERC721InvalidReceiver(address(0));

        eaddress currOwnerEnc = FHE.fromExternal(encryptedCurrentOwner, inputProof);
        eaddress toEnc = FHE.fromExternal(encryptedTo, inputProof);

        // Require the caller to be allowed on both the stored ciphertext and the provided one
        if (!FHE.isSenderAllowed(_encryptedOwner[tokenId])) revert UnauthorizedTransfer();
        if (!FHE.isSenderAllowed(currOwnerEnc)) revert UnauthorizedTransfer();

        // Clear approvals and transfer
        _approve(address(0), tokenId, _ownerOf(tokenId));
        transferFrom(ownerOf(tokenId), to, tokenId);

        // Update encrypted owner ciphertext and ACL for recipient
        _encryptedOwner[tokenId] = toEnc;
        FHE.allowThis(toEnc);
        FHE.allow(toEnc, to);
    }

    // --------------------
    // Overrides required by Solidity for multiple inheritance
    // --------------------
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
