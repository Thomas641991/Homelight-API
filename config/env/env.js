let env = {
    webPort: process.env.PORT || 3000,
    dbHost: process.env.DB_HOST || '',
    dbPort: process.env.DB_PORT || '',
    dbUser: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASSWORD || '',
    dbDatabase: process.env.DB_DATABASE || ''
};

module.exports = {
    env: env
};
