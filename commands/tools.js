const axios = require('axios');

async function wikipedia(client, message, chat, args) {
    if (!args[0]) {
        await message.reply('❌ Uso: !wiki <término>\nEjemplo: !wiki Messi');
        return;
    }
    const query = args.join(' ');
    try {
        const res = await axios.get('https://es.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query), { timeout: 8000 });
        const data = res.data;
        if (data.title && data.extract) {
            let text = data.extract.length > 1000 ? data.extract.substring(0, 1000) + '...' : data.extract;
            await message.reply(`📚 *${data.title}*\n\n${text}\n\n🔗 ${data.content_urls?.desktop?.page || ''}`);
        } else {
            await message.reply('❌ No encontré información sobre eso.');
        }
    } catch {
        await message.reply('❌ No encontré resultados en Wikipedia.');
    }
}

async function weather(client, message, chat, args) {
    if (!args[0]) {
        await message.reply('❌ Uso: !clima <ciudad>\nEjemplo: !clima Madrid');
        return;
    }
    const city = args.join(' ');
    try {
        const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%h+%w&m`, { timeout: 8000 });
        const text = res.data.trim();
        await message.reply(`🌤 *Clima en ${city}*\n\n${text}`);
    } catch {
        await message.reply('❌ No pude obtener el clima. Verifica el nombre de la ciudad.');
    }
}

async function password(client, message, chat, args) {
    const length = parseInt(args[0]) || 12;
    if (length < 6 || length > 50) {
        await message.reply('❌ La longitud debe ser entre 6 y 50.');
        return;
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pwd = '';
    for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    await message.reply(`🔐 *Contraseña generada* (${length} caracteres)\n\n||${pwd}||`);
}

async function qrGenerator(client, message, chat, args) {
    if (!args[0]) {
        await message.reply('❌ Uso: !qr <texto o URL>\nEjemplo: !qr https://google.com');
        return;
    }
    const text = encodeURIComponent(args.join(' '));
    const { MessageMedia } = require('whatsapp-web.js');
    try {
        const media = await MessageMedia.fromUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${text}`);
        await client.sendMessage(chat.id._serialized, media, { caption: `📱 QR: ${args.join(' ')}` });
    } catch {
        await message.reply('❌ Error al generar el código QR.');
    }
}

async function shortenUrl(client, message, chat, args) {
    if (!args[0]) {
        await message.reply('❌ Uso: !acortar <url>\nEjemplo: !acortar https://google.com');
        return;
    }
    try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(args[0])}`, { timeout: 5000 });
        await message.reply(`🔗 *URL acortada*\n\nOriginal: ${args[0]}\nCorta: ${res.data}`);
    } catch {
        await message.reply('❌ Error al acortar la URL.');
    }
}

async function define(client, message, chat, args) {
    if (!args[0]) {
        await message.reply('❌ Uso: !definir <palabra>\nEjemplo: !definir amor');
        return;
    }
    const word = args.join(' ');
    try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`, { timeout: 8000 });
        const data = res.data[0];
        let msg = `📖 *${data.word}*\n`;
        if (data.phonetic) msg += `🔊 ${data.phonetic}\n`;
        if (data.meanings) {
            data.meanings.slice(0, 2).forEach(m => {
                msg += `\n*${m.partOfSpeech}*:\n`;
                m.definitions.slice(0, 2).forEach(d => {
                    msg += `• ${d.definition}\n`;
                });
            });
        }
        await message.reply(msg);
    } catch {
        await message.reply('❌ No encontré definiciones para esa palabra.');
    }
}

async function ipInfo(client, message, chat, args) {
    const ip = args[0] || (await axios.get('https://api.ipify.org', { timeout: 5000 })).data;
    try {
        const res = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 5000 });
        const d = res.data;
        if (d.status === 'success') {
            await message.reply(`🌐 *IP: ${d.query}*\n\n🌍 País: ${d.country}\n🏙 Ciudad: ${d.city}\n🏢 ISP: ${d.isp}\n📍 Coord: ${d.lat}, ${d.lon}`);
        } else {
            await message.reply('❌ IP no válida.');
        }
    } catch {
        await message.reply('❌ Error al consultar la IP.');
    }
}

async function lyrics(client, message, chat, args) {
    if (!args[0]) {
        await message.reply('❌ Uso: !letra <artista> - <canción>\nEjemplo: !letra Queen - Bohemian Rhapsody');
        return;
    }
    const query = args.join(' ');
    try {
        const res = await axios.get(`https://api.lyrics.ovh/v1/${query.replace(' - ', '/')}`, { timeout: 8000 });
        let lyrics = res.data.lyrics || 'No disponible';
        lyrics = lyrics.length > 2000 ? lyrics.substring(0, 2000) + '...' : lyrics;
        await message.reply(`🎤 *Letra de ${query}*\n\n${lyrics}`);
    } catch {
        await message.reply('❌ No encontré la letra. Usa: !letra Artista - Canción');
    }
}

module.exports = { wikipedia, weather, password, qrGenerator, shortenUrl, define, ipInfo, lyrics };
