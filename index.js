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
      const order = response.data.order
      console.log(chalk.green(`[${Date.now()}] ${order.side} order ${order.quantity} at $${order.price}`))
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

let flip = true
spamOrders = () => {
  if(flip) {
    cortrex.submitOrder(BTCUSDT, SELL, LIMIT, GTC, 0.1, 1100, (Date.now()))
  } else {
    cortrex.submitOrder(BTCUSDT, BUY, LIMIT, GTC, 0.1, 13000, (Date.now()))
  }
  setTimeout(()=>{
    flip = !flip
    spamOrders()
  },200)

}
spamOrders()
