import ssz from "@chainsafe/ssz";
import {ValidatorIndex, BeaconBlock, BeaconState, bytes48, Epoch} from "../types";
import RPCProvider from "./stubs/rpc";
import {blsSign} from "../stubs/bls";
import {getDomain, slotToEpoch} from "../chain/helpers/stateTransitionHelpers";
import {DOMAIN_BEACON_BLOCK, DOMAIN_RANDAO} from "./constants";
import {getEmptyBlock} from "../chain/helpers/genesis";

export default class BlockProcessingService {
  private validatorIndex: ValidatorIndex;
  private provider: RPCProvider;
  private privateKey: bytes48[];

  public constructor(index: ValidatorIndex, provider: RPCProvider, privateKey: bytes48[]) {
    this.validatorIndex = index;
    this.provider = provider;
    this.privateKey = privateKey;
  }

  /**
   * IFF a validator is selected construct a block to propose.
   * @returns {Promise<void>}
   */
  public async buildBlock(): Promise<BeaconBlock> {
    let block: BeaconBlock = getEmptyBlock();
    block = await this.assembleHeader(block);
    block = await this.assembleBody(block);
    return block;
  }

  private async assembleHeader(block: BeaconBlock): Promise<BeaconBlock> {
    const slot: number = await this.provider.getCurrentSlot();
    const prevBlock: BeaconBlock = await this.provider.getCurrentBlock();
    const curState: BeaconState = await this.provider.getCurrentState();
    const epoch = slotToEpoch(block.slot);
    // Note: To calculate state_root, the validator should first run the state transition function on an unsigned block
    // containing a stub for the state_root. It is useful to be able to run a state transition function that does not
    // validate signatures or state root for this purpose.
    block.slot = slot;
    block.parentRoot = ssz.hashTreeRoot(prevBlock, BeaconBlock);
    block.stateRoot = ssz.hashTreeRoot(curState, BeaconState);
    block.randaoReveal = blsSign(
      this.privateKey,
      ssz.hashTreeRoot(epoch, Epoch),
      getDomain(curState.fork, epoch, DOMAIN_RANDAO)
    );
    // TODO Eth1Data
    block.signature = blsSign(
      this.privateKey,
      ssz.signedRoot(block, BeaconBlock),
      getDomain(curState.fork, epoch, DOMAIN_BEACON_BLOCK)
    );

    return block;
  }

  private async assembleBody(block: BeaconBlock): Promise<BeaconBlock> {
    return block;
  }
}
