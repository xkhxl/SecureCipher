import React, { useContext } from 'react';
import styles from './styles.module.scss';
import TextField from './../../Components/FormUI/TextField';
import SubmitBtn from './../../Components/FormUI/SubmitBtn';
import { Formik, Form } from 'formik';
import { Web3Context } from './../../Context/web3/provider';
import * as Yup from 'yup';
import { ethers } from 'ethers';
import commonErrorMessages from './../../Utils/commonErrorMessages.json';

const TransactionForm = () => {
  const {
    account,
    isLoadingWeb3,
    contracts,
    connectToWallet,
    ethereum,
    validChain,
    getAllTransfers,
    refreshBalance
  } = useContext(Web3Context);

  const walletContract = contracts?.walletContract;

  const INITIAL_FORM_STATE = {
    receiver: '',
    message: '',
    amount: 1,
  };

  const FORM_VALIDATION = Yup.object().shape({
    receiver: Yup.string().required('Required'),
    message: Yup.string(),
    amount: Yup.number()
      .required('Required')
      .moreThan(0, 'Amount must be greater than 0')
      .test('decimals', 'Max 5 decimal places', value => {
        if (!value) return true;
        return /^\d+(\.\d{1,5})?$/.test(value.toString());
      }),
  });

  const transferFunds = async ({ receiver, message, amount }) => {
  try {
    const _amount = ethers.utils.parseEther(amount.toString());

    // 1. Create the smart contract transfer first
    const tx = await walletContract.createTransfer(receiver, _amount, message);
    await tx.wait(); // ✅ Wait until confirmed

    // 2. Send ETH manually through MetaMask
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: receiver,
        gas: '0x5208',
        value: _amount._hex
      }]
    });

    // 3. Refresh balance + transfers
    await refreshBalance();
    await getAllTransfers();

  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Transaction failed. Check console for details.");
  }
};


  const invalidChainMsg = process.env.NODE_ENV === 'development'
    ? commonErrorMessages.switchToDevelopmentChain
    : commonErrorMessages.switchToProductionChain;

  return (
    <div className={styles.transferForm} data-testid="transactionForm">

      <div>
        <h1>Transfer Ethereum</h1>
        <p>Use this to send Ethereum to another address.</p>
      </div>

      <Formik
        initialValues={INITIAL_FORM_STATE}
        validationSchema={FORM_VALIDATION}
        onSubmit={transferFunds}
      >
        <Form>
          <TextField name="from" label="From" value={account} disabled />
          <TextField name="receiver" label="Receiver" placeholder="0x..." />
          <TextField name="message" label="Message (Optional)" />
          <TextField name="amount" label="Amount (Eth)" />

          {isLoadingWeb3 ? null : ethereum ? validChain ? account ? (
            <SubmitBtn type="submit">Send</SubmitBtn>
          ) : (
            <SubmitBtn type="button" onClick={connectToWallet}>Connect Wallet</SubmitBtn>
          ) : (
            <div>{invalidChainMsg}</div>
          ) : (
            <div>Please install MetaMask</div>
          )}
        </Form>
      </Formik>
    </div>
  );
};

export default TransactionForm;
