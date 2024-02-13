// Just as Magic handles the creation of user wallets, ZeroDev handles the creation of smart contract accounts associated with the wallet.

import { useEffect, useState } from "react";
import { useMagic } from "../magic/MagicProvider";

import { createEcdsaKernelAccountClient } from "@zerodev/presets/zerodev";
import { providerToSmartAccountSigner } from "permissionless";
import { polygonMumbai } from "viem/chains";
import { AddressContext } from "../context";

export const useZeroDevKernel = () => {
	const { magic } = useMagic();
	const [kernelClient, setKernelClient] = useState<any>();
	const [scaAddress, setScaAddress] = useState<any>();

	useEffect(() => {
		const fetchAccount = async () => {
			const magicProvider = await magic?.wallet.getProvider();
			const smartAccountSigner = await providerToSmartAccountSigner(
				magicProvider
			);

			const client = await createEcdsaKernelAccountClient({
				chain: polygonMumbai,
				projectId: process.env.NEXT_PUBLIC_ZERODEV_SEPOLIA_PROJECT_ID!,
				signer: smartAccountSigner,
				paymaster: "NONE",
			});
			setKernelClient(client);

			setScaAddress(client.account.address);
		};

		fetchAccount();
	}, []);

	return {
		kernelClient,
		scaAddress,
		AddressContext,
	};
};
