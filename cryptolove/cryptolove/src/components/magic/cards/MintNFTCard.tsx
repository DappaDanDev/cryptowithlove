import React, { useCallback, useEffect, useState, useContext } from "react";
import Divider from "@/components/ui/Divider";
import { useMagic } from "../MagicProvider";
import FormButton from "@/components/ui/FormButton";
import FormInput from "@/components/ui/FormInput";
import ErrorText from "@/components/ui/ErrorText";
import Card from "@/components/ui/Card";
import CardHeader from "@/components/ui/CardHeader";
import { getFaucetUrl, getNetworkToken } from "@/utils/network";
import showToast from "@/utils/showToast";
import Spacer from "@/components/ui/Spacer";
import TransactionHistory from "@/components/ui/TransactionHistory";
import Image from "next/image";
import Link from "public/link.svg";
import { useZeroDevKernel } from "@/components/zeroDev/useZeroDevKernel";
import { encodeFunctionData, parseAbi, publicActions } from "viem";
import { AddressContext } from "../../context";
import { bundlerActions } from "permissionless";
import { MediaRenderer, useContract, useMetadata } from "@thirdweb-dev/react";

const MintNFT = () => {
  const { web3 } = useMagic();
  const { kernelClient } = useZeroDevKernel();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [disabled, setDisabled] = useState(!toAddress || !amount);
  const [hash, setHash] = useState("");
  const [toAddressError, setToAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const publicAddress = localStorage.getItem("user");

  const { scaAddress } = useZeroDevKernel();

  // const contractAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863";
  const contractAddress = "0xaDbf47f41Cc62CEd27953Fa777054D850070b059";
  const { contract } = useContract(contractAddress);
  const { data: metadata, isLoading: isLoadingMetadata } =
    useMetadata(contract);

  const contractABI = parseAbi([
    "function claim(address receiver, uint256 quantity, address currency, uint256 pricePerToken, AllowlistProof calldata allowlistProof, bytes memory data) external payable",
    "function balanceOf(address owner) external view returns (uint256 balance)",
  ]);

  useEffect(() => {
    setDisabled(!toAddress || !amount);
    setAmountError(false);
    setToAddressError(false);
  }, [amount, toAddress, scaAddress]);

  const mintNFT = useCallback(async () => {
    try {
      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await kernelClient.account.encodeCallData({
            to: contractAddress,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: contractABI,
              functionName: "claim",
              args: [scaAddress],
            }),
          }),
        },
      });

      const bundlerClient = kernelClient.extend(bundlerActions);

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      console.log("UserOp confirmed:", receipt.userOpHash);
      showToast({
        message: `Transaction Successful. TX Hash: ${userOpHash}`,
        type: "success",
      });
      setHash(userOpHash.hash);
      setToAddress("");
      setAmount("");
    } catch (err) {
      console.log(err);
    }

    setDisabled(false);
  }, [scaAddress]);

  return (
    <Card>
      <CardHeader id="mint-nft">Mint NFT</CardHeader>

      <FormButton onClick={mintNFT}>Mint Your NFT</FormButton>
      <MediaRenderer src={(metadata as { image: string })?.image} />
    </Card>
  );
};

export default MintNFT;
