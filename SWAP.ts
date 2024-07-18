import axios from 'axios';
import { ethers } from 'ethers';
import 'dotenv/config';

const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/mode');
const wallet = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY as string, provider);

// Адрес и ABI контракта
const contractAddress = '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64';
const oseanAbi = require('./oceanAbi.json');
const tokenAbi = require('./TokenAbi.json');
const USDC_Address = '0xd988097fb8612cc24eeC14542bC03424c656005f';
const ETH_Address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const Caller_Address = '0x2d6b88e2b1f8f69c039375fcea4deb0f5cbe3a71';

const contract = new ethers.Contract(contractAddress, oseanAbi, wallet);
const tokenContract = new ethers.Contract(USDC_Address, tokenAbi, wallet);

// Функция для выполнения запроса к OpenOcean API
async function getSwapQuote(chain: string, inTokenAddress: string, outTokenAddress: string, slippage: number, gasPrice: string, amount: string) {
    const url = `https://open-api.openocean.finance/v3/${chain}/swap_quote`;
    const params = {
        chain: chain,
        inTokenAddress: inTokenAddress,
        outTokenAddress: outTokenAddress,
        slippage: slippage,
        gasPrice: gasPrice,
        amount: amount,
        account: wallet.address
    };

    try {
        const response = await axios.get(url, { params });
        return response.data.data.data;
    } catch (error) {
        console.error('Error fetching swap quote:', error);
        throw error;
    }
}
async function getCurrentGasPrice(chain:string) {
    const url = `https://open-api.openocean.finance/v3/${chain}/gasPrice`;
    try {
        const response = await axios.get(url);
        if (response.data && response.data.code === 200) {
            return response.data.without_decimals.instant;  // Выбираем быструю стоимость газа
        } else {
            throw new Error('Failed to fetch gas prices');
        }
    } catch (error) {
        console.error('Error fetching current gas price:', error);
        throw error;
    }
}

// Параметры свапа
const chain = 'mode'; // Укажите нужную цепочку
const inTokenAddress = USDC_Address;
const outTokenAddress = ETH_Address;
const slippage = 1; // 1% slippage
const amount = '2.5'; // USDC amount in smallest units (6 decimals)

async function executeSwap() {
    try {
        // Получение актуальной стоимости газа
        const currentGasPrice = await getCurrentGasPrice(chain);
        console.log(currentGasPrice)

        // Получаем данные о свапе
        const swapQuote = await getSwapQuote(chain, inTokenAddress, outTokenAddress, slippage, currentGasPrice.toString(), amount);
            // Проверка баланса
            const balance = await tokenContract.balanceOf(wallet.address);
            console.log(`USDC Balance: ${ethers.utils.formatUnits(balance, 6)}`);

            // Подтверждение разрешения токена
            // const approvalTx = await tokenContract.approve(contractAddress, ethers.utils.parseUnits('2.5', 6));
            // console.log('Approval Transaction Hash:', approvalTx.hash);
            // await approvalTx.wait();

        const gasPrise = await wallet.getGasPrice();

            // Отправка транзакции
            const tx1 = {
                from:wallet.address,
                to: contractAddress,
                data: swapQuote,
                gasPrice:gasPrise,
                value:0
            };
        const estimatedGas = await wallet.estimateGas(tx1);

        //const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
        const tx = {
            from:wallet.address,
            to: contractAddress,
            data: swapQuote,
            gasLimit: estimatedGas,
            gasPrice: gasPrise,
            value:0,
        };

            const txResponse = await wallet.sendTransaction(tx);
            console.log('Transaction Hash:', txResponse.hash);
            await txResponse.wait();
            console.log('Transaction confirmed:', txResponse);
         } catch (error) {
             console.error('Error executing swap:', error);
    }
}

executeSwap().catch(console.error);

