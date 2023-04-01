class CustomError extends Error {
    statusCode: number;
    constructor(message: string, code: number) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = code;
    }

    static badRequest(message: string) {
        return new CustomError(message, 400);
    }

    static unauthorized(message: string) {
        return new CustomError(message, 401);
    }

    static forbidden(message: string) {
        return new CustomError(message, 403);
    }

    static notFound(message: string) {
        return new CustomError(message, 404);
    }

    static conflict(message: string) {
        return new CustomError(message, 409);
    }

    static internal(message: string) {
        return new CustomError(message, 500);
    }
}

export default CustomError;
