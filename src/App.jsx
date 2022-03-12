import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from 'ethers';

// Components
import WalletNotConnected from './components/WalletNotConnected';
import InputForm from './components/InputForm';

// Assets
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';

// Constants
import { networks } from './utils/networks';
import { tld, CONTRACT_ADDRESS, abi } from './utils/constants';
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
	// ===== STATE =====
	const [currentAccount, setCurrentAccount] = useState('');
	const [network, setNetwork] = useState('');
	const [mints, setMints] = useState([]);

	// ===== FUNCTIONS =====
	// Gotta make sure this is async.
	const checkIfWalletIsConnected = async () => {
		// First make sure we have access to window.ethereum
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
			return;
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			setCurrentAccount(account);
		} else {
			console.log('No authorized accounts found');
		}

		// check the user's network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged);
		
		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) return;

			const accounts = await ethereum.request({ method: "eth_requestAccounts" });
			setCurrentAccount(accounts[0]);
			
		} catch (error) {
			console.log(error);
		}
	}

	const fetchMints = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

				const names = await contract.getAllNames();

				const mintRecords = await Promise.all(names.map(async (name) => {
					const mintRecord = await contract.records(name);
					const owner = await contract.domains(name);
					return {
						id: names.indexOf(name),
						name: name,
						record: mintRecord,
						owner: owner,
					}
				}));
				console.log('Mints fetched', mintRecords);
				setMints(mintRecords);
			}
		} catch (error) {
			console.log(error);
		}
	}


	// ===== EFFECTS ======
	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

	useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
			fetchMints();
		}
	}, [currentAccount, network])
	
  return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
            <div className="left">
              <p className="title">🐱‍👤 Web3 Name Service</p>
              <p className="subtitle">Your immortal API on the blockchain!</p>
            </div>
						<div className="right">
							<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
							{ currentAccount ? (
								<p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p>
								) : (<p> Not connected </p>) }
						</div>
					</header>
				</div>

				{ !currentAccount && <WalletNotConnected onConnectWallet={connectWallet} /> }
				{ currentAccount && 
					<InputForm 
						isCorrectNetwork={network === 'Polygon Mumbai Testnet'}
						fetchMints={fetchMints}
						mints={mints}
						currentAccount={currentAccount}
						/>
				}

        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
