#!/usr/bin/env node

const fs = require('fs')
const Web3 = require('web3')
const argv = require('yargs')
  .option('output', {
    alias: 'o',
    describe: 'output file',
    default: 'accounts.txt'
  })
  .option('endpoint', {
    alias: 'e',
    default: 'http://localhost:8545',
    describe: 'Ethereum rpc endpoint.'
  })
  .option('to-block', {
    describe: 'end block',
    default: 'latest'
  })
  .option('from-block', {
    describe: 'start block',
    default: 'latest'
  })
  .option('target', {
    describe: 'contract address or json file containing an array of addresses',
    type: 'string',
    demandOption: true
  })
  .option('signature', {
    describe: 'Contract method signature',
    type: 'string',
    default: ''
  })
  .help()
  .usage('Export the list of EOA that have called a method of a contract')
  .argv

const web3 = new Web3(argv.endpoint)

const error = (msg) => {
  console.error(msg)
  process.exit(1)
}

const checkAddress = (addr) => {
  if (!web3.utils.isAddress(addr)) error(`Invalid address: ${addr}`)
}

const writeLine = (outstream, line) => {
  outstream.cork()
  outstream.write(line)
  outstream.write('\n')
  outstream.uncork()
}

const start = async () => {
  const latestBlockNumber = await web3.eth.getBlockNumber()
  const fromBlock = argv['from-block'] === 'latest' ? latestBlockNumber : parseInt(argv['from-block'])
  const toBlock = argv['to-block'] === 'latest' ? latestBlockNumber : parseInt(argv['to-block'])
  const targetsList = (fs.existsSync(argv.target)
    ? JSON.parse(fs.readFileSync(argv.target, 'utf8'))
    : [argv.target]
  ).map(addr => addr.toLowerCase())
  targetsList.forEach(checkAddress)
  const targets = new Set(targetsList)
  if (argv.signature !== '' && !/^0x[0-9A-Fa-f]{8}$/.test(argv.signature)) error('Invalid signature')
  const signature = argv.signature.toLowerCase()
  const outstream = fs.createWriteStream(argv.output)
  console.log(`writing addresses list to ${argv.output}`)

  const validAddresses = new Set()
  for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
    console.log('processing block', blockNumber)
    const block = await web3.eth.getBlock(blockNumber, true)
    for (const tx of block.transactions) {
      const fromAddress = tx.from.toLowerCase()
      if (validAddresses.has(fromAddress)) continue
      if (tx.to == null || !targets.has(tx.to.toLowerCase())) continue
      if (!tx.input.startsWith(signature)) continue
      console.log(`address found: ${fromAddress} - transaction: ${tx.hash}`)
      validAddresses.add(fromAddress)
      writeLine(outstream, fromAddress)
    }
  }
  outstream.end()
  // fs.writeFileSync(argv.output, JSON.stringify(Array.from(validAddresses), null, 4))
  console.log('Done.')
}

start()
  .then(() => process.exit(0))
  .catch(error)
