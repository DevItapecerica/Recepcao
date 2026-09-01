export class AppError extends Error {
    constructor(public message: string, public statusCode: number, public error?: any) {
        super(message);
    }
} 