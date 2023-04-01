import express from 'express';
import { NftController } from '../controller';

const router = express.Router();
router.post('/mint', NftController.instance.mint);
router.get('/get-contract-info', NftController.instance.getContractInfo);
router.get('/get-all-transactions', NftController.instance.getAllTransactions);


export default router;