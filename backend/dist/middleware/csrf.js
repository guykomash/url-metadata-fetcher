"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = csrf;
require("dotenv/config");
const crypto_1 = __importDefault(require("crypto"));
const csrfTokensMap = new Map();
function csrf(req, res, next) {
    const token = crypto_1.default.randomUUID();
    csrfTokensMap.set(token, 'valid');
    res.cookie('csrf-token', token, {
        httpOnly: true,
        secure: process.env.MODE === 'production',
        sameSite: 'strict',
    });
    next();
}
//# sourceMappingURL=csrf.js.map