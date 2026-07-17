class ApiError extends Error {

    statusCode: number;
    message: string = "Something went wrong";
    errors: any[] = [];
    stack: string = "";
    data: any;
    success: boolean = false;

    constructor(statusCode: number, message?: string, errors?: any[], stack: string = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors || [];

        if (stack) {
            this.stack = stack;
        } else {
            (Error as ErrorConstructor & { captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void }).captureStackTrace?.(this, this.constructor);
        }
    }
}

export { ApiError };