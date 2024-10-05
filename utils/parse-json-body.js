const parseJsonBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                req.body = JSON.parse(body);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
};

module.exports = parseJsonBody;
