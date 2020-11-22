const http = require('http')
const crypto = require('crypto')
const spawn = require('child_process')
const sendMail = require('./sendMail')
const SECRET = '123456'
function sign1 (body) {
    return `sha1=`+crypto.createHmac('sha1', SECRET).update(body).digest('hex')
}
let server = http.createServer(function(req, res) {
    if (req.method == 'POST' && req.url == '/webhook') {
        let buffers = []
        req.on('data', function (data) {
            buffers.push(data)
        })
        req.on('data', function (buffer) {
            let body = Buffer.concat(buffers)
            let event = req.headers['x-github-event'] // event=push
            // github请求来的时候，要传递请求体body，另外还会传一个signature过来，你需要验证签名对不对
            let sign = req.headers['x-hub-signature']
            if (sign !== sign1(body)) {
                return res.end('Not Allowed')
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ok: true}))
            if (event == 'push') {
                // 开始部署
                let payload = JSON.parse(body)
                let child = spawn('sh', [`./${payload.repository.name}.sh`])
                let buffers = []
                child.stdout.on('data', function (buffer) {
                    buffers.push(buffer)
                })
                child.stdout.on('end', function (buffer) {
                    let logs = Buffer.concat(buffers)
                    console.log(logs)
                    sendMail(`
                        <h1>部署日期：${new Date()}</h1>
                        <h1>部署人：${payload.pusher.name}</h1>
                        <h1>部署邮箱：${payload.pusher.email}</h1>
                        <h1>提交信息：${payload.head_commit && payload.head_commit['message']}</h1>
                        <h1>部署日志：${logs.replace("\r\n", '<br />')}</h1>
                    `)
                })
            }
        })
    } else {
        res.end('Not Found')
    }
})

server.listen(4000, () => {
    console.log('webhook服务已经在4000端口上启动')
})