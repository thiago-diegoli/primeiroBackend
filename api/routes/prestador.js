import express from 'express'
import {connectToDatabase} from '../utils/mongodb.js'
import {check, validationResult } from 'express-validator';

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'prestadores'

const validaPrestador = [
    check('cnpj')
        .not().isEmpty().trim().withMessage('É obrigatório informar o CNPJ')
        .isNumeric().withMessage('O CNPJ deve ter apenas números')
        .isLength({min:14, max:14}).withMessage('O CNPJ deve ter 14 números')
        .custom(async (cnpj) => {
            const contaPrestador = await db.collection(nomeCollection)
            .countDocuments({'cnpj': cnpj})
            if(contaPrestador > 0){
                throw new Error('O CNPJ informado já está cadastrado!')
            }
        }),
    check('razao_social')
        .not().isEmpty().trim().withMessage('A razão social é obrigatória')
        .isLength({max:200}).withMessage('A razão é muito longa. Máximo de 200')
        .isAlphanumeric('pt-BR', {ignore: '/. '}).withMessage('A razão social não pode conter caractéres especiais'),
    check('cep')
        .isLength({min:8, max:8}).withMessage('O CEP informado é inválido')
        .isNumeric().withMessage('O CEP deve ter apenas números')
        .not().isEmpty().trim().withMessage('É obrigatório informar o CEP'),
    check('endereco.logradouro').notEmpty().withMessage('O logadouro é obrigatório.'),
    check('endereco.bairro').notEmpty().withMessage('O bairro é obrigatório.'),
    check('endereco.localidade').notEmpty().withMessage('A localidade é obrigatória.'),
    check('endereco.uf').isLength({min:2, max:2}).withMessage('A UF é inválida.'),
    check('cnae_fiscal').isNumeric().withMessage('O CNAE deve ser um número.'),
    check('nome_fantasia').optional({nullable: true}),
    check('data_inicio_atividade').matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('O formato de data é inválido. Informe yyyy-mm-dd'),
    check('localizacao.type').equals('Point').withMessage('Tipo inválido'),
    check('localizacao.coordinates').isArray().withMessage('Coordenadas inválidas'),
    check('localizacao.coordinates.*').isFloat().withMessage('Os valores das coordenadas devem ser números')

]

/**
 * GET /api/prestadores
 * Lista de todos os prestadores de serviço
 * Parâmetros: limit, skip e order
 */
router.get('/', async (req, res) => {
    const {limit, skip, order} = req.query
    try {
        const docs = []
        await db.collection(nomeCollection)
                .find()
                .limit(parseInt(limit) || 10)
                .skip(parseInt(skip) || 0)
                .forEach((doc) => {
                    docs.push(doc)
                })
        res.status(200).json(docs)
    } catch(err) {
        res.status(500).json({
            message: 'Erro ao obter a listagem dos prestadores',
            error: `${err.message}`
        })
    }
})
/**
 * GET /api/prestadores/id/:id
 * Lista o prestador de serviço pelo id
 * Parâmetros: id
 */

router.get('/id/:id', async (req, res) => {
    try {
        const docs = []
        await db.collection(nomeCollection)
            .find({'_id': {$eq: new ObjectId(req.params.id)}}, {})
            .forEach((doc) => {
                docs.push(doc)
            })
            res.status(200).json(docs)
    } catch(err){
        res.status(500).json({
            erros: [{
                value: `${err.message}`,
                msg: 'Erro ao obeter o prestador pelo ID',
                param: 'id/:id'
            }]
        })
    }
})

/**
 * GET /api/prestadores/razao/:filter
 * Lista o prestador de serviço pela razão social
 * Parâmetros: filtro
 */
router.get('/razao/:filtro', async (req, res) => {
    try {
        const filtro = req.params.filtro.toString()
        const docs = []
        await db.collection(nomeCollection)
            .find({
                $or: [
                    {'razao_social': {$regex: filtro, $options: 'i'}},
                    {'nome_fantasia': {$regex: filtro, $options: 'i'}}
                ]
            })
            .forEach((doc) => {
                docs.push(doc)
            })
            res.status(200).json(docs)
    } catch(err){
        res.status(500).json({
            erros: [{
                value: `${err.message}`,
                msg: 'Erro ao obeter o prestador pela razão social',
                param: 'razao/:filtro'
            }]
        })
    }
})

/**
 * DELETE /api/prestadores/:id
 * remove o prestador de serviço pelo id
 * Parâmetros: id
 */
router.delete('/:id', async(req, res) => {
    const result = await db.collection(nomeCollection).deleteOne({
        "_id": { $eq: new ObjectId(req.params.id)}
    })
    if (result.deletedCount === 0) {
        res.status(404).json({
            errors: [{
                value: `Não há nenhum pretador com o id ${req.params.id}`,
                msg: 'Erro ao excluir o prestador',
                param: '/:id'
            }]
        })
    } else {
        res.status(200).send(result)
    }
})

/**
 * POST /api/prestadores
 * Insere um novo prestadores de serviço
 * Parâmetros: Objeto prestador
 */

router.post('/', validaPrestador, async(req, res) => {
    try {
        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            return res.status(400).json({errors: erros.array()})         
        }
        const prestador = await db.collection(nomeCollection).insertOne(req.body)
        res.status(201).json(prestador)
    } catch(err) {
        res.status(500).json({message: `${err.message} Erro no server`})

    }
})
/**
 * PUT /api/prestadores
 * Altera um prestador de serviço pelo _id
 * Parâmetros: Objeto prestador 
 */
router.put('/', validaPrestador, async(req, res) => {
    let idDocumento = req.body._id
    delete req.body._id
    try {
        /* if (req.method === 'PUT') {
            req.check('cnpj').skip().if(idDocumento)
        } */
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const prestador = await db.collection(nomeCollection)
        .updateOne({'_id': {$eq: new ObjectId(idDocumento)}},
                   {$set: req.body})
        res.status(202).json(prestador)
    } catch(err) {
        res.status(500).json({errors: err.message})
    }
})
export default router