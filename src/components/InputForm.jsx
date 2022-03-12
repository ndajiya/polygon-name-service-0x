import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, tld } from '../utils/constants';
import contractAbi from '../utils/contractABI.json';

import MintedDomains from './MintedDomains';

const InputForm = ({ isCorrectNetwork, fetchMints, mints, currentAccount }) => {
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);

	const mintDomain = async () => {
		if (!domain) {
			setError('Enter domain');
			return;
		}
		if (domain.length < 3) {
			setError('Domain must be at least 3 characters long');
			return;
		}
		if (domain.length > 14) {
			setError('Max domain length is 14 characters');
			return;
		}

		setLoading(true);
		setError('');

		// 3 chars = 0.05 MATIC, 4 chars = 0.03 MATIC, 5 or more = 0.01 MATIC
		const price = domain.length === 3 ? '0.05' : domain.length === 4 ? '0.03' : '0.01';
		console.log("Minting domain", domain, "with price", price);

		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				let tx = await contract.register(domain, { value: ethers.utils.parseEther(price)});
				const receipt = await tx.wait();
				if (receipt.status === 1) {
					console.log('Domain minted! https://mumbai.polygonscan.com/tx/'+tx.hash);
					tx = await contract.setRecord(domain, record);
					await tx.wait();
					console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);

					// Call fetchMints after 2 seconds
					setTimeout(() => {
						fetchMints();
					}, 2000);
						
					setRecord('');
					setDomain('');
				} else {
					setError('Failed to mint domain, please try again. Status='+receipt.status);
				}
			}
		} catch (error) {
			console.log(error);
			setError('Failed to mint domain')
		}
		setLoading(false);
	}

	const updateDomain = async () => {
		if (!record || !domain) return;
		setLoading(true);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				let tx = await contract.setRecord(domain, record);
				await tx.wait();
				console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);

				fetchMints();
				setRecord('');
				setDomain('');
			}
		} catch (error) {
			console.log(error);
			setError('Failed to update domain');
		}
		setLoading(false);
	}

	const selectRecordToEdit = (name) => {
		setEditing(true);
		setDomain(name);
	}

	const cancelEditing = () => {
		setEditing(false);
		setDomain('');
		setRecord('');
	}

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				await window.ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: "0x13881" }]
				})
			} catch (error) {
				// Error code 4902 means the chain has not been added to MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: "wallet_addEthereumChain",
							params: [
								{
									chainId: '0x13881',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
										name: "Mumbai Matic",
										symbol: "MATIC",
										decimals: 18
									},
									blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
								}
							]
						})
					} catch (error) {
						console.log(error);
					}
				} else {
					console.log(error);
				}
			}
		} else {
			setError('MetaMask is not installed. Install it to use app: https://metamask.io/download.html');
		}
	}

	let formDisabled = false;
	if (!isCorrectNetwork || loading) {
		formDisabled = true;
	}
	
	return (
		<div className="form-container">
			<div className="first-row">
				<input
					type="text"
					value={domain}
					placeholder='domain'
					onChange={e => setDomain(e.target.value)}
				/>
				<p className='tld'> {tld} </p>
			</div>

			<input
				type="text"
				value={record}
				placeholder='Data to store at domain'
				onChange={e => setRecord(e.target.value)}
			/>

			{ editing ? (
				<div className="button-container">
					<button className='cta-button mint-button' disabled={formDisabled} onClick={() => updateDomain()}>
						Set Record
					</button>
					<button className='cta-button mint-button' onClick={() => cancelEditing()}>Cancel</button>
				</div>
			) : (
				<button className='cta-button mint-button' disabled={formDisabled} onClick={() => mintDomain()}>
					Mint
				</button>  
			)}

			<div>
				{ error && <p>{error}</p>}
				{ !isCorrectNetwork && (
						<div className="connect-wallet-container">
							<h2>Please switch to Polygon Mumbai Testnet</h2>
							<button className='cta-button connect-wallet-button' onClick={switchNetwork}>Click here to switch</button>
						</div>
					)}
			</div>

			<MintedDomains mints={mints} currentAccount={currentAccount} onEditRecord={selectRecordToEdit} />
		</div>
	)
}

export default InputForm;