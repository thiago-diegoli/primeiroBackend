import express from 'express'
import {config} from 'dotenv'
config() // carrega variáveis do .env

const app = express()
const {PORT} = process.env
// import das rotas da aplicação
import RotasPrestadores from './routes/prestador.js'

app.use(express.json()) // habilita o parse do JSON
// rota de conteúdo público
app.use('/', express.static('public'))
// removendo o x-powered-by por segurança
app.disable('x-powered-by')
// configurando o favicon
app.use('/favicon.ico', express.static('public/images/logo-api.png'))

// rota default
app.get('/api', (req, res)=> {
    res.status(200).json({
        message: 'API FATEC 100% FUNCIONAL 🚀',
        version: '1.0.0'
    })
})
app.use('/api/prestadores', RotasPrestadores)
// listening
app.listen(PORT, function(){
    console.log(`💻 Servidor rodando na porta ${PORT}`)
})