const http = require('http')
const crypto = require('crypto')
const SECRET = '123456'
function sign (body) {
    return `sha1=${crypto.createHmac('sha1', SECRET).update(body).digest('hex')}`
}
let server = http.createServer(function(req, res) {
    if (req.method == 'POST' && req.url == '/webhook') {
        let buffers = []
        req.on('data', function (data) {
            buffers.push(data)
        })
        req.on('data', function (buffer) {
            let body = Buffer.concat(buffers)
            let event = req.header['x-github-event'] // event=push
            // github请求来的时候，要传递请求体body，另外还会传一个signature过来，你需要验证签名对不对
            let sign = req.headers['x-hub-signature']
            if (sign !== sign(body)) {
                return res.end('Not Allowed')
            }
        })
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ok: true}))
    } else {
        res.end('Not Found')
    }
})

server.listen(4000, () => {
    console.log('webhook服务已经在4000端口上启动')
})