const { ethers } = require('ethers');
const fs = require("fs")
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_KEY)

const blockNumbers = [17870894,17814778,17854974,17817370,17854967,17817396,17817378,17815669];
const txHashes = ['0xf8b44a045e748d0f94212ad9d89d21422e6445397fb84fb1931991e2397fb675','0x30a942b6c55014ab94b96f5f6e994c751a71d752f24b4425fb8461d7e0f84617','0xdbcf9876da0174f3da0b4ef822befcdfa5a8b0f179c6c60f6a1cbd6c4f97e85b','0x1ec66b4b30c7febb75b267e36a4cf0dc9a8c7b970f294af23236a46f440643b2','0xc8f190258e93bc4c10ed8a75121eb051274e9d788022075de8af59809e2cb1b7','0xcc3c0dadccd727614ba60e6c6eff3955201783ac3561550bb867618768d36374','0x3947c2f417d377e9459dc19915bbbadd3bfa0ee59a2dcc5ffecc17a67405be6e','0xe8436b0cc7075c63b3cb7af1620036f866877b8975b6964703605da499ea1c9e'];

const writeFile = (filePath, data) => {
    fs.writeFile("./output/"+ filePath, data, (err) => { 
        if(err) { 
        throw err;
        }
        console.log("Data has been written to " + filePath + " successfully."); 
    }); 
}

async function getTransactionLogs(blockNumber, txHash) {
    const block = await provider.getBlock(blockNumber);
    const transactionReceipt = await provider.getTransactionReceipt(txHash);
    return transactionReceipt.logs;
}

async function getTokensDataFromLogs(logs) {
    const tokensData = [];
    logs.forEach((log, idx) => {
        const tokenID = parseInt(log.topics[3])
        tokensData.push(tokenID);
    });
    let uniqueTokenIDs = [...new Set(tokensData)];
    console.log('Unique tokenID count:', uniqueTokenIDs.length)

    return uniqueTokenIDs;
}

async function main(blockNumbers, transactionHashes){
    let tokenIDsOfTransactions = []
    for(let i = 0; i < blockNumbers.length;++i){
        const transactionLogs = await getTransactionLogs(blockNumbers[i], transactionHashes[i]);
        tokenIDsOfTransactions.push(await getTokensDataFromLogs(transactionLogs))
    }
    
    writeFile('tokenIDsOfTransaction.txt', tokenIDsOfTransactions.toString());
}

main(blockNumbers, txHashes);




