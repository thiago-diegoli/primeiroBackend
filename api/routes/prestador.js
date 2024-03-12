import express from 'express'
import {connectToDatabase} from '../utils/mongodb.js'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'prestadores'

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

export default router