import {
    Address,
    Cell,
    serializeDict,
    beginDict,
    beginCell,
    Slice,
    parseDict,
} from 'ton';
import BN from 'bn.js';
import { Sha256 } from '@aws-crypto/sha256-js';

const ONCHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_PREFIX = 0x00;

export type IcoMetaDataKeys = 'name' | 'description' | 'image';

const icoOnChainMetadataSpec: {
    [key in IcoMetaDataKeys]: 'utf8' | 'ascii' | undefined;
} = {
    name: 'utf8',
    description: 'utf8',
    image: 'ascii',
};

const sha256 = (str: string) => {
    const sha = new Sha256();
    sha.update(str);
    return Buffer.from(sha.digestSync());
};

export function buildIcoMetadataCell(data: { [s: string]: string | undefined }): Cell {
    const KEYLEN = 256;
    const dict = beginDict(KEYLEN);

    Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {
        if (!icoOnChainMetadataSpec[k as IcoMetaDataKeys])
            throw new Error(`Unsupported onchain key: ${k}`);
        if (v === undefined || v === '') return;

        let bufferToStore = Buffer.from(v, icoOnChainMetadataSpec[k as IcoMetaDataKeys]);

        const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

        const rootCell = new Cell();
        rootCell.bits.writeUint8(SNAKE_PREFIX);
        let currentCell = rootCell;

        while (bufferToStore.length > 0) {
            currentCell.bits.writeBuffer(bufferToStore.slice(0, CELL_MAX_SIZE_BYTES));
            bufferToStore = bufferToStore.slice(CELL_MAX_SIZE_BYTES);
            if (bufferToStore.length > 0) {
                const newCell = new Cell();
                currentCell.refs.push(newCell);
                currentCell = newCell;
            }
        }

        dict.storeRef(sha256(k), rootCell);
    });

    return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict.endDict()).endCell();
}

export function parseIcoMetadataCell(contentCell: Cell): {
    [s in IcoMetaDataKeys]?: string;
} {
    const toKey = (str: string) => new BN(str, 'hex').toString(10);
    const KEYLEN = 256;
    const contentSlice = contentCell.beginParse();
    if (contentSlice.readUint(8).toNumber() !== ONCHAIN_CONTENT_PREFIX)
        throw new Error('Expected onchain content marker');

    const dict = contentSlice.readDict(KEYLEN, s => {
        const buffer = Buffer.from('');

        const sliceToVal = (s: Slice, v: Buffer, isFirst: boolean) => {
            s.toCell().beginParse();
            if (isFirst && s.readUint(8).toNumber() !== SNAKE_PREFIX)
                throw new Error('Only snake format is supported');

            v = Buffer.concat([v, s.readRemainingBytes()]);
            if (s.remainingRefs === 1) {
                v = sliceToVal(s.readRef(), v, false);
            }

            return v;
        };

        return sliceToVal(s.readRef(), buffer, true);
    });

    const res: { [s in IcoMetaDataKeys]?: string } = {};

    Object.keys(icoOnChainMetadataSpec).forEach(k => {
        const val = dict
            .get(toKey(sha256(k).toString('hex')))
            ?.toString(icoOnChainMetadataSpec[k as IcoMetaDataKeys]);
        if (val) res[k as IcoMetaDataKeys] = val;
    });

    return res;
}

export interface contractConfig {
    admin_address: Address;
    metadata: {
        name: string;
        image: string;
        description: string;
    };
    total_supply: BN;
    jetton_wallet_code: Cell;
}

export function icoMasterInitData(config: contractConfig): Cell {
    return beginCell()
        .storeCoins(config.total_supply)
        .storeAddress(config.admin_address)
        .storeRef(buildIcoMetadataCell(config.metadata))
        .storeRef(config.jetton_wallet_code)
        .endCell();
}

export function initMessage() {
    return null;
}

export enum OPS {
  
}