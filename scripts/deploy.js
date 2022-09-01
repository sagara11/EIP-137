// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer, client1] = await ethers.getSigners();
  const node = await nameHash("eth.storage");
  const subNodeBytes = await hash("thong");
  const subNode = await ethers.utils.keccak256(subNodeBytes);

  const Storage = await hre.ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();
  await storage.deployed();
  console.log(`Storage deployed to ${storage.address}`);

  const ENS = await hre.ethers.getContractFactory("ENS");
  const ens = await ENS.deploy(signer.address, node);
  await ens.deployed();
  console.log(`ENS deployed to ${ens.address}`);

  const Resolver = await hre.ethers.getContractFactory("Resolver");
  const resolver = await Resolver.deploy();
  await ens.deployed();
  console.log(`Resolver deployed to ${resolver.address}`);
  await resolver.setAddr(node, storage.address);

  const FIFSRegistrar = await hre.ethers.getContractFactory("FIFSRegistrar");
  const fIFSRegistrar = await FIFSRegistrar.deploy(ens.address, node);
  await fIFSRegistrar.deployed();
  console.log(`FIFSRegistrar deployed to ${fIFSRegistrar.address}`);

  await ens.setResolver(node, resolver.address);

  // Start for user
  const addressStorage = await resolver.addr(node);
  const storageInstance = await ethers.getContractAt("Storage", addressStorage);
  await storageInstance.store(511);

  //Subnode for user
  const tx = await fIFSRegistrar.register(subNode, signer.address);
  const rc = await tx.wait(1);
  const event = rc.events?.filter((x) => {
    return x.event == "Register";
  });

  const { _node, _label, _owner } = event[0].args;

  const abi = ethers.utils.defaultAbiCoder;
  const params = await abi.encode(["bytes32", "bytes32"], [_node, _label]);

  const newSubNodeHash = await ethers.utils.keccak256(params);
  await resolver.setAddr(newSubNodeHash, storage.address);

  const addressStorageSub = await resolver.addr(newSubNodeHash);
  const addressStorageSubInstance = await ethers.getContractAt(
    "Storage",
    addressStorageSub
  );
  await addressStorageSubInstance.store(511111);
}

// def namehash(name):
// if name == '':
//   return '\0' * 32
// else:
//   label, _, remainder = name.partition('.')
//   return sha3(namehash(remainder) + sha3(label))

// console.log(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(_collectionId)));
// console.log(ethers.utils.toUtf8String(test), _collectionId);

async function nameHash(name) {
  if (name == "") {
    return ethers.constants.HashZero;
  } else {
    const label = name.split(".");
    const labelBytes = await hash(label[0]);
    const labelHash = await ethers.utils.keccak256(labelBytes);

    let remainder = name;
    const afterProcess = remainder.substring(remainder.indexOf(".") + 1);

    remainder = afterProcess == name ? "" : afterProcess;
    const nameHashResult = await nameHash(remainder);
    const concatedBytes = await concatBytes(nameHashResult, labelHash);

    const concatedHash = await ethers.utils.keccak256(concatedBytes);
    return await ethers.utils.keccak256(concatedHash);
  }
}

async function concatBytes(first, second) {
  const buf1 = Buffer.from(first);
  const buf2 = Buffer.from(second);
  const arr = [buf1, buf2];

  const buf = Buffer.concat(arr);
  return buf;
}

async function hash(data) {
  return await ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
