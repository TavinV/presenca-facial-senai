import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
});

redis.on('connect', () => {
    console.log('Conectado ao Redis com sucesso. ⚡');
});

redis.on('error', (err) => {
    console.error('Erro ao conectar ao Redis:', err);
    process.exit(1); // Encerra a aplicação em caso de erro
});

export default redis;
