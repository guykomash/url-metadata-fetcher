"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logger;
function logger(req, res, next) {
    console.log(`LOG: ${req.method} ${req.url}`);
    next();
}
//# sourceMappingURL=logger.js.map