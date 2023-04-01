import { Request, Response } from "express";
import { IEvent } from "../_types_";

export default (controller: (req: IEvent) => any) => {
    return async (req: Request, res: Response) => {
        const event: IEvent = {
            params: req.params,
            query: req.query,
            body: req.body,
            baseUrl: req.baseUrl,
        };
        try {
            const data = await controller(event);
            res.json({
                data,
            });
        } catch (error: any) {
            res.status(error.statusCode ? error.statusCode : 500).send(
                error.message ?? "Internal Server Error"
            );
        }
    };
};
