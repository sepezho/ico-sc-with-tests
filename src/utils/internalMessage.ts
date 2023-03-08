import BN from "bn.js";
import {
  Address,
  Cell,
  CellMessage,
  CommonMessageInfo,
  InternalMessage,
} from "ton";
import { randomAddress, zeroAddress } from "./randomAddress";

export function internalMessage(params: {
  from?: Address;
  to?: Address;
  value?: BN;
  bounce?: boolean;
  bounced?: boolean;
  body?: Cell;
}) {
  const message = params.body ? new CellMessage(params.body) : undefined;
  return new InternalMessage({
    from: params.from ?? randomAddress("sender"),
    to: params.to ?? zeroAddress,
    value: params.value ?? 0,
    bounce: params.bounce ?? true,
    bounced: params.bounced ?? false,
    body: new CommonMessageInfo({ body: message }),
  });
}
