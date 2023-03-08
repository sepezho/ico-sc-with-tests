import {
    beginCell,
    contractAddress,
    toNano,
} from 'ton';
import BN from "bn.js"
import { contractConfig } from './IcoV1.data';
import { JWSourceV1CodeCell } from './JWV1.source';
import { icoContract } from './IcoContract';
import { internalMessage } from './utils/internalMessage'
import { randomAddress } from './utils/randomAddress';

const op = {
    mint: 21,
    transfer: 0xf8a7ea5,
    burn_notification: 0x7bdd97de,
}

const config: contractConfig = {
    admin_address: randomAddress('admin'),
    metadata: {
        name: 'ICO',
        image: 'https://www.linkpicture.com/q/download_183.png', // todo change image url
        description: 'This is sample contract for ico',
    },
    total_supply: toNano(100),
    jetton_wallet_code: JWSourceV1CodeCell, // todo add code of JW
};

describe('ICO sc', () => {
    let contract: icoContract;

    beforeEach(async () => {
        contract = await icoContract.createFromConfig(config);
    });

    it('test getter', async () => {
        const tx = await contract.contract.invokeGetMethod('test', []);
        expect(tx.exit_code).toEqual(0);
        expect(tx.result[0]).toEqual(new BN(1));
    });

    it('ico buy jettons', async () => {
        const tx = await contract.contract.sendInternalMessage(
            internalMessage({
                from: randomAddress('user'),
                value: toNano(2),
                body: beginCell().endCell(),
            }),
        );

        expect(tx.exit_code).toEqual(0);
        expect(tx.actionList.length).toEqual(1);

        const txAction = tx.actionList[0];
        expect(txAction.type).toEqual('send_msg');
    });

    it('ico mint jettons', async () => {
        const tx = await contract.contract.sendInternalMessage(
            internalMessage({
                from: randomAddress('admin'),
                value: toNano(2),
                body: beginCell()
                    .storeUint(op.mint, 32)
                    .storeUint(0, 64)
                    .storeAddress(randomAddress('user'))
                    .storeCoins(toNano(1)) //tons
                    .storeRef(beginCell()
                        .storeUint(op.transfer, 32)
                        .storeUint(0, 64)
                        .storeCoins(toNano(1)) //jettons
                        .storeAddress(randomAddress('user')) //todo re-check
                        .storeAddress(randomAddress('admin')) //todo re-check
                        .storeCoins(toNano(1)) //todo re-check
                        .endCell())
                    .endCell(),
            }),
        );

        expect(tx.exit_code).toEqual(0);
        expect(tx.actionList.length).toEqual(1);

        const txAction = tx.actionList[0];
        expect(txAction.type).toEqual('send_msg');
    });

    it('ico burn jettons', async () => {
        const masterContractAddress = contractAddress({
            workchain: 0,
            initialCode: JWSourceV1CodeCell,
            initialData: beginCell()
                .storeCoins(toNano(0))
                .storeAddress(randomAddress('user'))
                .storeAddress(contract.address)
                .storeRef(JWSourceV1CodeCell)
                .endCell(),
        });

        console.log(`master contract address: ${masterContractAddress.toFriendly()}`)
        const tx = await contract.contract.sendInternalMessage(
            internalMessage({
                from: masterContractAddress,
                value: toNano(2),
                body: beginCell()
                    .storeUint(op.burn_notification, 32)
                    .storeUint(0, 64)
                    .storeCoins(toNano(1)) //jetton amount
                    .storeAddress(randomAddress('user')) //who burn the tokens
                    .storeAddress(randomAddress('user'))//responce add
                    .endCell(),
            }),
        );
        console.log(tx.debugLogs)
        expect(tx.exit_code).toEqual(0);
        expect(tx.actionList.length).toEqual(1);

        const txAction = tx.actionList[0];
        expect(txAction.type).toEqual('send_msg');
    });
});

