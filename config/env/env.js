let env = {
    webPort: process.env.PORT || 3000,
    dbHost: process.env.DB_HOST || '',
    dbPort: process.env.DB_PORT || '',
    dbUser: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASSWORD || '',
    dbDatabase: process.env.DB_DATABASE || '',
    TOKEN_SECRET: process.env.TOKEN_SECRET || '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611'
};

module.exports = {
    env: env
};
