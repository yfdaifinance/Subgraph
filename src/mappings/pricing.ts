/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../types/schema'
import { BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD, UNTRACKED_PAIRS } from './helpers'

const WETH_ADDRESS = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
// const WETH_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
const USDC_WETH_PAIR = '0x7d51bad48d253dae37cc82cad07f73849286deec' // created 10008355
const DAI_WETH_PAIR = '0xe69Fe44b087EaB9d0f1CBdcf63c1b266dcc556FE' // created block 10042267
const USDT_WETH_PAIR = '0xb21C3387aa3dc5F476Ac8678e3F3C9520EB52eF9' // created block 10093341

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let daiPair = Pair.load(Address.fromString(DAI_WETH_PAIR).toHexString()) // dai is token0
  let usdcPair = Pair.load(Address.fromString(USDC_WETH_PAIR).toHexString()) // usdc is token0
  let usdtPair = Pair.load(Address.fromString(USDT_WETH_PAIR).toHexString()) // usdt is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1).plus(usdtPair.reserve0)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
    return daiPair.token0Price
      .times(daiWeight)
      .plus(usdcPair.token0Price.times(usdcWeight))
      .plus(usdtPair.token1Price.times(usdtWeight))
    // dai and USDC have been created
  } else if (daiPair !== null && usdtPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdtPair.reserve1)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdtPair.reserve1.div(totalLiquidityETH)
    return daiPair.token0Price.times(daiWeight).plus(usdtPair.token0Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdtPair !== null) {
    return usdtPair.token1Price
  } else {
    return ZERO_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', // AAVE
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
  '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
  '0x172370d5Cd63279eFa6d502DAB29171933a610AF', // CRV
  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
  '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', // LINK
  '0xb33EaAd8d922B1083446DC23f610c2567fB5180f', //UNI
  '0x914034f0FF781c430Aa9594851cC95806fd19dc6', // SSGT
  '0xd0cfd20E8bBDb7621B705a4FD61de2E80C2cD02F', //SSGTX
  '0x7E7fF932FAb08A0af569f93Ce65e7b8b23698Ad8', // Yf-DAI
  '0x3c5D1617C30BA71972adD4b0C9A6B9848f2afeeD', // DAO1
  '0x831753DD7087CaC61aB5644b308642cc1c33Dc13', // QUICK
  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
  '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
  '0x428360b02C1269bc1c79fbC399ad31d58C1E8fdA', //DEFIT
  '0x0EE392bA5ef1354c9bd75a98044667d307C0e773', // ORN
  '0xF8d7195eEB28c7449f7ef8557fF9A4Da86da0c64', // I7

  // '0xd6df932a45c0f255f85145f286ea0b292b21c90b', // aave
  // '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // usdc
  // '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // usdt
  // '0x172370d5cd63279efa6d502dab29171933a610af', // crv
  // '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // dai
  // '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', // link
  // '0xb33eaad8d922b1083446dc23f610c2567fb5180f', //uni
  // '0x914034f0ff781c430aa9594851cc95806fd19dc6', // ssgt
  // '0xd0cfd20e8bbdb7621b705a4fd61de2e80c2cd02f', //ssgtx
  // '0x7e7ff932fab08a0af569f93ce65e7b8b23698ad8', // yf-dai
  // '0x3c5d1617c30ba71972add4b0c9a6b9848f2afeed', // dao1
  // '0x831753dd7087cac61ab5644b308642cc1c33dc13', // quick
  // '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // weth
  // '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // wmatic
  // '0x428360b02c1269bc1c79fbc399ad31d58c1e8fda', //defit
  // '0x0ee392ba5ef1354c9bd75a98044667d307c0e773', // orn
  // '0xf8d7195eeb28c7449f7ef8557ff9a4da86da0c64', // i7
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('400000')

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('2')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  pair: Pair
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // dont count tracked volume on these pairs - usually rebass tokens
  if (UNTRACKED_PAIRS.includes(pair.id)) {
    return ZERO_BD
  }

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
    let reserve0USD = pair.reserve0.times(price0)
    let reserve1USD = pair.reserve1.times(price1)
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0
      .times(price0)
      .plus(tokenAmount1.times(price1))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
