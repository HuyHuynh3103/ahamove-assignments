import express from 'express';
import { NftController } from '../controller';

const router = express.Router();
router.post('/mint', NftController.mint);


export default router;