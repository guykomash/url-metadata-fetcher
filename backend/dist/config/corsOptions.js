"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const clientUrl = process.env.CLIENT_URL || 'https://127.0.0.1:8080';
const corsOptions = {
    origin: clientUrl,
};
exports.corsOptions = corsOptions;
//# sourceMappingURL=corsOptions.js.map