module.exports = class ValidateError extends Error{
    constructor(message){
        super();
        this.status = 422;
        this.messageE = message
    }
}