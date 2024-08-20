"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./middleware/logger"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const validator_1 = __importDefault(require("validator"));
const helmet_1 = __importDefault(require("helmet"));
const url_metadata_1 = __importDefault(require("url-metadata"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const corsOptions_1 = require("./config/corsOptions");
const cors_1 = __importDefault(require("cors"));
const csrf_1 = __importDefault(require("./middleware/csrf"));
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(corsOptions_1.corsOptions));
app.use(rateLimiter_1.rateLimiter);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(logger_1.default);
app.use(csrf_1.default);
app.post('/fetch-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body) {
            return res.status(400).json({ err: 'No body in request' });
        }
        const { urls } = req.body;
        if (!urls) {
            return res.status(400).json({ err: 'No urls in request body' });
        }
        if (!Array.isArray(urls) || urls.length < 3) {
            return res.status(400).json({
                err: 'Server got less than 3 URLs. Try again with more URLs.',
            });
        }
        const URLPromises = urls.map((url, index) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (!validator_1.default.isURL(url)) {
                    throw new Error('Invalid URL.');
                }
                const response = yield (0, url_metadata_1.default)(url)
                    .then((metadata) => {
                    return metadata;
                })
                    .catch((err) => {
                    throw new Error('Invalid URL.');
                });
                const { title, description, image } = response;
                return Promise.resolve({
                    index: index,
                    url: url,
                    title: title ? title : 'No title in metadata.',
                    description: description
                        ? description
                        : 'No description in metadata.',
                    image: image ? image : 'No image in metadata.',
                });
            }
            catch (err) {
                let errorMessege = `Failed to fetch the metadata of this URL. :(`;
                if (err instanceof Error) {
                    errorMessege = err.message;
                }
                return Promise.reject({
                    index: index,
                    url: url,
                    error: errorMessege,
                });
            }
        }));
        Promise.allSettled(URLPromises).then((fetchedMetadatas) => {
            res.status(200).json({ metadatas: fetchedMetadatas });
        });
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ err: 'Server error occured while fetching data.' });
    }
}));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
exports.default = app;
//# sourceMappingURL=index.js.map