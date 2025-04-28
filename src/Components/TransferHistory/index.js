import React, { useContext, useEffect } from 'react';
import styles from './styles.module.scss';
import { Web3Context } from './../../Context/web3/provider';
import { ethers } from 'ethers';
import commonErrorMessages from './../../Utils/commonErrorMessages.json';

const TransferHistory = () => {
  const { contracts, account, isFetching, isLoadingWeb3,
    ethereum, validChain, getAllTransfers, transfers, setIsFetching } = useContext(Web3Context);

  useEffect(() => {
    if ((typeof contracts === 'object' && Object.keys(contracts).length > 0) && validChain) {
      if (account) getAllTransfers();
      else setIsFetching(false);
    }
  }, [contracts, validChain, account, getAllTransfers, setIsFetching]);

  const shouldRender = {
    component: Array.isArray(transfers) && transfers.length > 0,
  };

  const invalidChainMsg = process.env.NODE_ENV === 'development'
    ? commonErrorMessages.switchToDevelopmentChain : commonErrorMessages.switchToProductionChain;

  function shortenAddress(address) {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  }

  function getTimeAgo(timestamp) {
    const now = Date.now() / 1000; // seconds
    const secondsAgo = Math.floor(now - timestamp);

    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutes = Math.floor(secondsAgo / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return shouldRender.component ? (
    <div className={styles.transferHistory} data-testid="transferHistory">
      <h1>Latest Transfers on Ethereum Network</h1>

      {transfers.slice().reverse().map((transfer, pos) => {
        const { fromAddress, toAddress, amount, message, timestamp } = transfer;
        const formattedAmount = ethers.utils.formatEther(amount);
        const _timestamp = timestamp?.toNumber();
        const timeAgo = _timestamp ? getTimeAgo(_timestamp) : '';

        return (
          <div key={pos} className={styles.transfer}>
            <div className={styles.transferRow}>
              
              <div className={styles.addresses}>
                <a href={`https://etherscan.io/address/${fromAddress}`} target="_blank" rel="noopener noreferrer">
                  {shortenAddress(fromAddress)}
                </a>
                <span>→</span>
                <a href={`https://etherscan.io/address/${toAddress}`} target="_blank" rel="noopener noreferrer">
                  {shortenAddress(toAddress)}
                </a>
              </div>

              <div className={styles.amount}>
                {Number(formattedAmount).toFixed(4)} ETH
              </div>

            </div>

            <div className={styles.meta}>
              <span>{timeAgo}</span>
              {message && <p className={styles.message}>Message: {message}</p>}
            </div>

          </div>
        );
      })}
    </div>
  ) : (isLoadingWeb3 || isFetching) ? null : ethereum ? validChain ? account ? (
    <div className={styles.wrongNetwork} data-testid="transferHistory">
      <i className="fa-solid fa-money-bill-transfer"></i>
      <p>No transfers yet!</p>
    </div>
  ) : (
    <div className={styles.wrongNetwork} data-testid="transferHistory">
      <i className="fa-solid fa-wallet"></i>
      <p>Please connect your wallet</p>
    </div>
  ) : (
    <div className={styles.wrongNetwork} data-testid="transferHistory">
      <i className="fa-solid fa-hand"></i>
      <p>{invalidChainMsg}</p>
    </div>
  ) : (
    <div className={styles.wrongNetwork} data-testid="transferHistory">
      <i className="fa-solid fa-triangle-exclamation"></i>
      <p>Please install MetaMask</p>
    </div>
  );
};

export default TransferHistory;
