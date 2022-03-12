import React from 'react';
import { CONTRACT_ADDRESS, tld } from '../utils/constants';

const MintedDomain = ({ mint, isOwner, onEditRecord }) => {
	return (
		<div className="mint-item">
			<div className="mint-row">
				<a 
					className="link" 
					href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} 
					target="_blank" 
					rel="noopener noreferrer"
				>
					<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
				</a>
				{ isOwner && (
					<button className="edit-button" onClick={() => onEditRecord(mint.name)}>
						<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
					</button>
				)}
			</div>
			<p>{mint.record}</p>
		</div>
	)
}

const MintedDomains = ({ mints, currentAccount, onEditRecord }) => {
	return (
		<div className="mint-container">
			<p className="subtitle">Recently minted domains</p>
			<div className='mint-list'>
				{ mints.map((mint, index) => (
					<MintedDomain 
						key={index} 
						mint={mint} 
						isOwner={mint.owner.toLowerCase() === currentAccount.toLowerCase()} 
						onEditRecord={onEditRecord}
					/>
				))}
			</div>
		</div>
	)
}

export default MintedDomains;