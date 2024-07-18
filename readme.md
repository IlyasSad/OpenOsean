# Ethereum Token Swap Script

Этот скрипт позволяет выполнять обмен токенов через Ethereum блокчейн, используя OpenOcean API для получения котировок свопа.

## Описание функций

### `getSwapQuote(chain, inTokenAddress, outTokenBlockhainess, slippage, gasPrice, amount)`

Получает котировку для обмена токенов.

**Параметры:**
- `chain`: строка, идентификатор сети, в которой выполняется транзакция.
- `inTokenAddress`: строка, адрес ERC-20 токена, который вы отдаете.
- `outTokenAddress`: строкa, адрес ERC-20 токена, который вы получаете.
- `slippage`: число, допустимый уровень проскальзывания цены в процентах.
- `gasPrice`: строка, цена газа для транзакции в Gwei.
- `amount`: строка, количество токенов для обмена в минимальных единицах токена.

### `getCurrentGasPrice(chain)`

Получает текущую рыночную цену газа для указанной блокчейн-сети.

**Параметры:**
- `chain`: строка, идентификатор блокчейн-сети.

### `executeSwap()`

Выполняет своп токенов на основе полученных данных и текущей стоимости газа.

**Описание процесса:**
1. Получение текущей стоимости газа.
2. Получение котировки свопа.
3. Подготовка и отправка транзакции свопа.

## Установка и настройка


```ALICE_PRIVATE_KEY=<Ваш приватный ключ>```

Убедитесь, что следующие пакеты установлены в вашем проекте:

```bash
npm install ethers axios dotenv
