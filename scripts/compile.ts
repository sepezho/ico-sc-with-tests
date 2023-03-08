import { writeFile } from 'fs/promises';
import path from 'path';
import { beginCell, Cell } from 'ton';
import { icoSourceV1 } from '../src/IcoV1.source';
import { JWSourceV1 } from '../src/JWV1.source';
import { compileFunc } from '../src/utils/compileFunc';

const buildSourceContent = (master: Cell) => `import { Cell } from "ton";
import { combineFunc } from "./utils/combineFunc";

export const icoSourceV1 = () => {
    return combineFunc(__dirname, [
      './contract/imports/stdlib.fc',
      './contract/imports/params.fc',
      './contract/imports/op-codes.fc',
      './contract/imports/utils.fc',
      './contract/imports/jetton-utils.fc',
      './contract/ico.fc',
    ])
  }

const icoSourceV1CodeBoc =
  '${master.toBoc().toString('base64')}'

export const icoSourceV1CodeCell = Cell.fromBoc(Buffer.from(icoSourceV1CodeBoc, 'base64'))[0];

export const JWSourceV1 = () => {
    return combineFunc(__dirname, [
      './contract/imports/stdlib.fc',
      './contract/imports/op-codes.fc',
      './contract/imports/jetton-utils.fc',
      './contract/imports/params.fc',
      './contract/jetton-wallet.fc',
    ])
  }

const JWSourceV1CodeBoc =
  '${master.toBoc().toString('base64')}'

export const JWSourceV1CodeCell = Cell.fromBoc(Buffer.from(JWSourceV1CodeBoc, 'base64'))[0];
`;

async function main() {
    let master = await compileFunc(icoSourceV1());
    await writeFile(
        path.resolve(__dirname, '../src/IcoV1.source.ts'),
        buildSourceContent(master.cell),
    ).catch(e => console.log(e));
}

main();
