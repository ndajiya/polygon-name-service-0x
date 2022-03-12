import React from 'react';

const WalletNotConnected = ({ onConnectWallet }) => (
	<div className="connect-wallet-container">
			<img src="https://media.giphy.com/media/3ohc0Rnm6JE0cg0RvG/giphy.gif" alt="Funny gif" />
			<button className="cta-button connect-wallet-button" onClick={() => onConnectWallet()}>
				Connect Wallet
			</button>
		</div>
)

export default WalletNotConnected;