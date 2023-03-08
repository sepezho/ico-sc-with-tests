import { SmartContract } from 'ton-contract-executor';
import { Address, beginCell, Cell, contractAddress, parseDict, Slice, toNano } from 'ton';
// import BN from 'bn.js';
import { icoMasterInitData, OPS, contractConfig } from './IcoV1.data';
import { icoSourceV1 } from './IcoV1.source';
import { compileFunc } from './utils/compileFunc';
// import { randomAddress } from './utils/randomAddress';

export class icoContract {
    private constructor(public readonly contract: SmartContract, public readonly address: Address) { }

    static async createFromConfig(config: contractConfig) {
        const code = await compileFunc(icoSourceV1());

        const data = icoMasterInitData(config);
        const contract = await SmartContract.fromCell(code.cell, data);

        const address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell,
        });

        contract.setC7Config({
            myself: address,
        });

        return new icoContract(contract, address);
    }
}
