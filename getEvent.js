const { ethers } = require('ethers');
const fs = require("fs")
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_KEY)

//change stakingABI.json
const { abi: contractABI } = require("./ZIPS.json");
const contractAddress = "0xb0640E8B5F24beDC63c33d371923D68fDe020303";

let temporaryTimestamp;

let tokensToCheck = [3981,4110,4083,5867,8067,2033,1083,4725,7967,4814,3970,6516,3695,8213,8248,1083,4083,278,3981,4083,4110,4110,2004,3836,3955,8792,647,5689,1440,8780,1881,7641,3327,445,1078,1102,4705,6950,672,1941,8550,3410,4051,8481,3181,6950,5244,1406,4116,1240,5434,4640,6265,5739,5497,7754,8403,4785,5243,7339,7289,2363,1654,2771,4369,571,6950,7270,2916,8260,5963,3970,4814,7147,5363,1912,2493,4640,6643,6684,3714,4102,4763,1882,2939,1874,8182,7548,3892,6460,153,307,6620,6578,5847,5828,6438,166,3602,8855,5618,4186,5634,6913,3250,3642,6528,7013,5460,1550,6068,1434,6919,6551,194,1188,6855,4532,5868,4116,2753,847,7976,5293,4389,4389,3557,3753,5323,1148,1148,6855];

let uniqueTokensToCheck = [...new Set(tokensToCheck)];

let tokenIDs = [];
let walletAddresses = [];
let timestamps = [];

let failedTokens = [];

let counter = 0;

const writeFile = (filePath, data) => {
    fs.writeFile("./output/"+ filePath, data, (err) => { 
        if(err) { 
        throw err;
        }
        console.log("Data has been written to " + filePath + " successfully."); 
    }); 
}

const getEventSignature = (eventName, abi) => {
    const eventAbi = abi.find((entry) => entry.name === eventName);
    const types = eventAbi.inputs.map((input) => input.type);
    return `${eventName}(${types.join(',')})`;
}

async function checkOwnerAndTimestamp(startingBlock,endBlock,tokenID) {

    const eventSignature = getEventSignature('Transfer', contractABI)

    const filter = {
        address: contractAddress,
        topics: [
            ethers.utils.id(eventSignature),
            ,
            ,
            ethers.utils.hexZeroPad(tokenID, 32)
        ],
        fromBlock: startingBlock,
        toBlock: endBlock,
    };
    console.log('Getting logs of tokenID:' , tokenID)
    const result = await provider.getLogs(filter)
    const contractInterface = new ethers.utils.Interface(contractABI);

    let ownerOfToken;
    let latestTransferBlock;

    result.forEach((log, idx) => {
        const decodedLog = contractInterface.decodeEventLog('Transfer', log.data, log.topics);
        //if its not sent to staking contract, change new owner
        if(decodedLog.to != "0xa1A9b59FFe51B69A8Ba305C4813267c69626297d"){
            ownerOfToken = decodedLog.to;
            latestTransferBlock = log.blockNumber;
        }
    });

    temporaryTimestamp = (await provider.getBlock(latestTransferBlock)).timestamp;

    tokenIDs.push(tokenID);
    walletAddresses.push(ownerOfToken);
    timestamps.push(temporaryTimestamp);
    counter++;
    
    console.log('----------------')
    console.log('Counter:' , counter)
    console.log('Owner of token:' , ownerOfToken)
    console.log('Latest transfer timestamp:' , temporaryTimestamp)
    console.log('----------------')

}

async function main(){

    for(let i = 0; i < uniqueTokensToCheck.length; i++){
        try {
            await checkOwnerAndTimestamp(16925030,18183912,uniqueTokensToCheck[i]);
        } catch (error) {
            console.log('Getting token data failed. Adding ' + uniqueTokensToCheck[i] + ' to failed array')
            console.log('----------------')
            failedTokens.push(uniqueTokensToCheck[i]);            
        }
        
    }

    writeFile("tokenIDs.txt",tokenIDs.toString());
    writeFile("walletAddresses.txt",walletAddresses.toString());
    writeFile("timestamps.txt",timestamps.toString());
    writeFile("failedTokens.txt",failedTokens.toString());

}

main();






