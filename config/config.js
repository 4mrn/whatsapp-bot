const config = {
    botName: 'AMRANI-BOT',
    version: '1.0.0',
    creator: 'AMRANI',
    prefix: '!',
    adminNumbers: ['611232228@c.us'],
    ignoreGroups: false,
    autoReplyPM: false,
    autoReact: true,
    reactEmoji: '❤️',
    musicEnabled: true,
    maxQueueSize: 20,
    defaultVolume: 50,
    commands: [
        'menu', 'play', 'stop', 'skip', 'queue', 'np', 'volume',
        'dado', 'moneda', 'ppt', 'numero', 'trivia', 'horoscopo',
        'frase', 'meme', 'insulto', 'abrazar', 'besar', 'cachetear', 'acariciar',
        'calcular', 'traducir', 'decir', '8ball',
        'wiki', 'clima', 'contraseña', 'qr', 'acortar', 'definir', 'ip', 'letra',
        'anuncio', 'limpiar', 'ban', 'kick', 'info', 'ping'
    ],
    apiKeys: {
        translate: 'tu-api-key',  // Opcional
        meme: ''                   // Opcional
    }
};

module.exports = config;
