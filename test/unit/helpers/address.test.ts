import {isValidAddress} from "../../../src/helpers/address";
import {expect} from "chai";

describe('Eth address helper', () => {

  it('should be valid address', () => {
    expect(isValidAddress('0x0000000000000000000000000000000000000000')).to.be.true;
    expect(isValidAddress('0x1C2D4a6b0e85e802952968d2DFBA985f2F5f339d')).to.be.true;
  });

  it('should not be valid address', () => {
    expect(isValidAddress('0x00')).to.be.false;
    expect(isValidAddress('TPB')).to.be.false;
    expect(isValidAddress(null)).to.be.false;
  })

});
