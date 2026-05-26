const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config/config');
const help = require('./commands/help');
const music = require('./commands/music');
const games = require('./commands/games');
const fun = require('./commands/fun');
const admin = require('./commands/admin');
const tools = require('./commands/tools');

const logFile = path.join(__dirname, 'bot.log');

function log(msg) {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync(logFile, line + '\n');
}

fs.ensureDirSync('./temp');
fs.ensureDirSync('./assets');

const processedIds = new Set();
const userCooldowns = new Map();
const RATE_LIMIT_MS = 2000;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session-data' }),
    puppeteer: {
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    log('Escanea el código QR con WhatsApp en tu teléfono');
});

client.on('ready', () => {
    log('✅ Bot conectado exitosamente');
    log(`📱 Nombre: ${config.botName}`);
    log(`👥 Prefijo: ${config.prefix}`);
});

client.on('authenticated', () => {
    log('🔐 Autenticación exitosa');
});

client.on('auth_failure', (msg) => {
    log('❌ Error de autenticación: ' + msg);
});

client.on('disconnected', (reason) => {
    log('🔌 Bot desconectado: ' + reason);
});

client.on('message_create', async (message) => {
    try {
        if (!message.body) return;

        if (processedIds.has(message.id.id)) return;
        processedIds.add(message.id.id);
        if (processedIds.size > 1000) {
            const arr = [...processedIds];
            for (let i = 0; i < 500; i++) processedIds.delete(arr[i]);
        }

        log(`📨 "${message.body}" | fromMe:${message.fromMe} | id:${message.id.id.substring(0,10)}`);

        if (!message.body.startsWith(config.prefix)) return;

        const now = Date.now();
        const lastCmd = userCooldowns.get(message.from);
        if (lastCmd && (now - lastCmd) < RATE_LIMIT_MS) return;
        userCooldowns.set(message.from, now);
        if (userCooldowns.size > 500) {
            const keys = [...userCooldowns.keys()];
            for (let i = 0; i < 250; i++) userCooldowns.delete(keys[i]);
        }

        const chat = await message.getChat();
        const contact = await message.getContact();
        const sender = contact.pushname || contact.number || 'Desconocido';
        const lugar = chat.isGroup ? '📢 ' + chat.name : '💬 DM';

        log(`⚡ Comando: ${message.body} | De: ${sender} | ${lugar}`);

        await handleCommand(message, chat, contact);

    } catch (error) {
        log('❌ Error: ' + error.message);
        if (error.stack) log(error.stack.split('\n').slice(0,3).join(' | '));
    }
});

async function handleCommand(message, chat, contact) {
    const args = message.body.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const sender = contact.pushname || contact.number || 'Usuario';
    const isAdmin = config.adminNumbers.includes(contact.number);
    const isGroupAdmin = chat.isGroup ? chat.participants.some(p => p.id._serialized === contact.id._serialized && p.isAdmin) : false;

    switch (command) {
        case 'menu':
        case 'help':
        case 'comandos':
        case 'h':
            await help.sendMenu(client, message, chat, config);
            break;

        case 'play':
        case 'musica':
        case 'music':
            if (!config.musicEnabled) {
                await message.reply('❌ La función de música está desactivada.');
                return;
            }
            await music.play(client, message, chat, args);
            break;

        case 'stop':
        case 'parar':
            await music.stop(client, message, chat);
            break;

        case 'skip':
        case 'saltar':
            await music.skip(client, message, chat);
            break;

        case 'queue':
        case 'cola':
            await music.queue(client, message, chat);
            break;

        case 'nowplaying':
        case 'np':
            await music.nowPlaying(client, message, chat);
            break;

        case 'volume':
        case 'volumen':
            await music.setVolume(client, message, chat, args);
            break;

        case 'dado':
        case 'dice':
            await games.dice(client, message, chat);
            break;

        case 'moneda':
        case 'coin':
            await games.coinFlip(client, message, chat);
            break;

        case 'ppt':
            await games.rps(client, message, chat, args);
            break;

        case 'numero':
        case 'number':
            if (!args[0]) {
                await message.reply('❌ Uso: !numero <min> <max>\nEjemplo: !numero 1 100');
                return;
            }
            await games.randomNumber(client, message, chat, args);
            break;

        case 'trivia':
        case 'pregunta':
            await games.trivia(client, message, chat);
            break;

        case 'horoscopo':
        case 'horoscope':
            if (!args[0]) {
                await message.reply('❌ Uso: !horoscopo <signo>\nEjemplo: !horoscopo sagitario');
                return;
            }
            await games.horoscope(client, message, chat, args[0]);
            break;

        case 'frase':
        case 'quote':
            await fun.randomQuote(client, message, chat);
            break;

        case 'meme':
            await fun.randomMeme(client, message, chat);
            break;

        case 'insulto':
        case 'insult':
            await fun.insult(client, message, chat, args);
            break;

        case 'abrazar':
        case 'hug':
            await fun.hug(client, message, chat, args);
            break;

        case 'besar':
        case 'kiss':
            await fun.kiss(client, message, chat, args);
            break;

        case 'cachetear':
        case 'slap':
            await fun.slap(client, message, chat, args);
            break;

        case 'acariciar':
        case 'pat':
            await fun.pat(client, message, chat, args);
            break;

        case 'calcular':
        case 'calc':
            if (!args[0]) {
                await message.reply('❌ Uso: !calcular <expresión>\nEjemplo: !calcular 2+2*3');
                return;
            }
            await fun.calculate(client, message, chat, args.join(' '));
            break;

        case 'traducir':
        case 'translate':
            if (args.length < 2) {
                await message.reply('❌ Uso: !traducir <idioma> <texto>\nEjemplo: !traducir en Hola mundo');
                return;
            }
            await fun.translate(client, message, chat, args);
            break;

        case 'decir':
        case 'say':
            if (!args[0]) {
                await message.reply('❌ Uso: !decir <texto>');
                return;
            }
            await message.reply(args.join(' '));
            break;

        case '8ball':
        case 'bola8':
            if (!args[0]) {
                await message.reply('❌ Uso: !8ball <pregunta>\nEjemplo: !8ball Me irá bien hoy?');
                return;
            }
            await fun.eightBall(client, message, chat, args.join(' '));
            break;

        case 'anuncio':
        case 'anunciar':
        case 'announce':
            if (!isAdmin && !isGroupAdmin) {
                await message.reply('❌ Solo administradores pueden usar este comando.');
                return;
            }
            if (!args[0]) {
                await message.reply('❌ Uso: !anuncio <mensaje>');
                return;
            }
            await admin.announce(client, message, chat, args.join(' '));
            break;

        case 'limpiar':
        case 'clear':
            if (!isAdmin && !isGroupAdmin) {
                await message.reply('❌ Solo administradores pueden usar este comando.');
                return;
            }
            await admin.clearChat(client, message, chat);
            break;

        case 'ban':
        case 'vetar':
            if (!isGroupAdmin) {
                await message.reply('❌ Solo administradores del grupo pueden usar este comando.');
                return;
            }
            await admin.banMember(client, message, chat, args);
            break;

        case 'kick':
            if (!isGroupAdmin) {
                await message.reply('❌ Solo administradores del grupo pueden usar este comando.');
                return;
            }
            await admin.kickMember(client, message, chat, args);
            break;

        case 'bot':
        case 'info':
            await info(client, message, chat);
            break;

        case 'ping':
            const start = Date.now();
            await message.reply('🏓 Pong!');
            const latency = Date.now() - start;
            await message.reply(`⏱ Latencia: ${latency}ms`);
            break;

        case 'wiki':
        case 'wikipedia':
            await tools.wikipedia(client, message, chat, args);
            break;

        case 'clima':
        case 'weather':
            await tools.weather(client, message, chat, args);
            break;

        case 'contraseña':
        case 'password':
            await tools.password(client, message, chat, args);
            break;

        case 'qr':
            await tools.qrGenerator(client, message, chat, args);
            break;

        case 'acortar':
        case 'shorten':
            await tools.shortenUrl(client, message, chat, args);
            break;

        case 'definir':
        case 'define':
            await tools.define(client, message, chat, args);
            break;

        case 'ip':
            await tools.ipInfo(client, message, chat, args);
            break;

        case 'letra':
        case 'lyrics':
            await tools.lyrics(client, message, chat, args);
            break;

        default:
            await message.reply(`❌ Comando "${config.prefix}${command}" no reconocido.\n📝 Usa ${config.prefix}menu para ver la lista de comandos.`);
    }
}

async function info(client, message, chat) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const infoMsg = `🤖 *${config.botName}*\n\n` +
        `⚡ *Versión:* ${config.version}\n` +
        `👑 *Creador:* ${config.creator}\n` +
        `⏱ *Actividad:* ${hours}h ${minutes}m ${seconds}s\n` +
        `📝 *Prefijo:* ${config.prefix}\n` +
        `📦 *Comandos:* ${config.commands.length}\n` +
        `🎵 *Música:* ${config.musicEnabled ? '✅' : '❌'}\n\n` +
        `📌 Usa *${config.prefix}menu* para ver los comandos.`;

    await message.reply(infoMsg);
}

client.initialize();

process.on('unhandledRejection', (error) => {
    log('🔥 Error no manejado: ' + error.message);
});

process.on('SIGINT', async () => {
    log('\n🛑 Apagando bot...');
    await fs.remove('./temp');
    process.exit(0);
});
