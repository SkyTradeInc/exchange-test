const dotenv = require('dotenv').config()
const apiKey = process.env.API_KEY
const secretKey = process.env.SECRET_KEY
const baseURL = process.env.BASE_URL
const CryptoJS = require('crypto-js')
const axios = require('axios')
const chalk = require('chalk')
const BUY = "BUY"
const SELL = "SELL"
const BTCUSDT = "BTCUSDT"
const GTC = "GTC"
const LIMIT = "LIMIT"

class Cortrex {
  constructor() {
    this.ordersProcessed = 0
  }

  constructSignature(params) {
    return String(CryptoJS.HmacSHA256(params, secretKey))
  }

  submitOrder(symbol, side, type, tif,quantity, price, timestamp, recvWindow=5000) {
    const params = `symbol=${symbol}&side=${side}&type=${type}&timeInForce=${tif}&quantity=${quantity}&price=${price}&recvWindow=${recvWindow}&timestamp=${timestamp}`
    const signature = this.constructSignature(params)
    const url = `${baseURL}/api/v1/order?${params}&signature=${signature}`
    axios.post(url, {}, {
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    })
    .then(response => {
      if(response.data.success) {
        console.log(chalk.green(`${side} order ${quantity} at $${price}`))
      } else {
        console.log(chalk.red(`${response.data.message}`))
      }
    })
    .catch(error => {
      console.log(error.response.data.msg)
    })
  }

  cancelOrder(symbol, orderId, timestamp) {
    const params = `symbol=${symbol}&orderId=${orderId}&timestamp=${timestamp}`
    const signature = this.constructSignature(params)
    const url = `${baseURL}/api/v1/order?${params}&signature=${signature}`
    axios.delete(url, {
      headers: {
        'X-MBX-APIKEY': apiKey
      },
      data: {}
    })
  }


}

const cortrex = new Cortrex
cortrex.submitOrder(BTCUSDT, 1,1,BUY)
