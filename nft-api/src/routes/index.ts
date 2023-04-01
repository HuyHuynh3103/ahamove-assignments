import { Application } from 'express'
import nftRouter from './nft.router';

function route(app: Application) {
    app.use('/api/nft', nftRouter);
}

export default route