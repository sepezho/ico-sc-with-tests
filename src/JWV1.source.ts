import { Cell } from "ton";
import { combineFunc } from "./utils/combineFunc";

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
    'te6ccsECDQEAAf4AAA0AEgAYAB0ALgAzAHQAeQDFAUYBTAHMAf4BFP8A9KQT9LzyyAsBAgFiBwICA3pgBgMCASAFBAAeqi3tRND6APpA1NQwf1UgAAarBnEAfa289qJofQB9IGpqGDYY/BQAuCoQCaoKAeQoAn0BLGeLAOeLZmSRZGWAiXoAegBlgGT8gDg6ZGWBZQPl/+ToQAICzQkIAJP3wUIgG4KhAJqgoB5CgCfQEsZ4sA54tmZJFkZYCJegB6AGWAZJB8gDg6ZGWBZQPl/+ToO8AMZGWCrGeLKAJ9AQnltYlmZmS4/YBAP30A6GmBgLjYSS+B8H0gGHaiaH0AfSBqahgS44BHIhrBBExLQCizUJBhAHlwJjgQQQgLxqKM5GWP5Z+RfQF8FGeLE2eLEP0BZYBkkwgbIER4A4JQIYnkKAJ9ASxni2ZmZPaqcBsCaY/pn8AKqRhdcYFBCD3uy+8J3XGBL4PAwLCgAIhA/y8AD8AfoA+kD4KFQSCXBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0FAGxwXy4EoToQNBRchQBPoCWM8WzMzJ7VQB+kAwINcLAcMAjh+CENUydttwgBDIywVQA88WIvoCEstqyx/LP8mAQvsAkVviAGBsIVExxwXy4EkC+kD6ANQwINCAYNch+gAwJxA0UELwB6BQI8hQBPoCWM8WzMzJ7VRTNOJh'

export const JWSourceV1CodeCell = Cell.fromBoc(Buffer.from(JWSourceV1CodeBoc, 'base64'))[0];

