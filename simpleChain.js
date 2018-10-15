const SHA256 = require('crypto-js/sha256')


const db = require('level')('./chaindata')

class Block {
  constructor (data) {
    this.hash = '',
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ''
  }
}


class Blockchain {
  constructor() {
    
    this.getBlockHeight().then((height) => {
      if (height === -1) {
        this.addBlock(new Block("Genesis block")).then(() => console.log("Genesis block added!"))
      }
    })
  }

 
  async addBlock(newBlock) {
    const height = parseInt(await this.getBlockHeight())

    newBlock.height = height + 1
    newBlock.time = new Date().getTime().toString().slice(0, -3)

    if (newBlock.height > 0) {
      const prevBlock = await this.getBlock(height)
      newBlock.previousBlockHash = prevBlock.hash
      console.log(`Previous hash: ${newBlock.previousBlockHash}`)
    }

    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
    console.log(`New hash: ${newBlock.hash}`)

    await this.addBlockToDB(newBlock.height, JSON.stringify(newBlock))
  }

 
  async getBlockHeight() {
    return await this.getBlockHeightFromDB()
  }

 
  async getBlock(blockHeight) {
    return JSON.parse(await this.getBlockFromDB(blockHeight))
  }

 
  async validateBlock(blockHeight) {
    let block = await this.getBlock(blockHeight);
    let blockHash = block.hash;
    block.hash = '';
    
    let validBlockHash = SHA256(JSON.stringify(block)).toString();

    if (blockHash === validBlockHash) {
        return true;
      } else {
        console.log(`Block #${blockHeight} invalid hash: ${blockHash} <> ${validBlockHash}`);
        return false;
      }
  }

 
  validateChain() {
    let errorLog = []
    let previousHash = ''
    let isValidBlock = false

   
const number=  this.getBlockHeightFromDB()
    for (let i = 0; i < number; i++)   {
           
                //validateBlock함수
                if(!validateBlock(i))
                   { console.log('validateBlock 이상해'); 
                   errorLog.push(i)}
                else{
                    console.log('vadidate block correct');
                }
        
               const blocks= this.getBlockFromDB(i);
               previousHash= blocks.previousBlockHash;
                const currentblocks= blocks.hash;
                
                if(previousHash !== currentblocks)
                    {
                        console.log('previous안같음');
                        errorLog.push(i)
                    }
                
                if(errorLog.length>0)
                  {
                   console.log('${errorLog}')
                   }
                
            }
  }

  addBlockToDB(key, value) {
    return new Promise((resolve, reject) => {
      db.put(key, value, (error) => {
        if (error) {
          reject(error)
        }

        console.log(`Added block #${key}`)
        resolve(`Added block #${key}`)
      })
    })
  }

  getBlockFromDB(key) {
    return new Promise((resolve, reject) => {
      db.get(key, (error, value) => {
        if (error) {
          reject(error)
        }

        resolve(value)
      })
    })
  }

  getBlockHeightFromDB() {
    return new Promise((resolve, reject) => {
      let height = -1

      db.createReadStream().on('data', (data) => {
        height++
      }).on('error', (error) => {
        reject(error)
      }).on('close', () => {
        resolve(height)
      })
    })
  }
}

let blockchain = new Blockchain();

(function theLoop (i) {
  setTimeout(() => {
    blockchain.addBlock(new Block(`Test data ${i}`)).then(() => {
      if (--i) {
        theLoop(i)
      }
    })
  }, 100);
})(10);

setTimeout(() => blockchain.validateChain(), 2000)
