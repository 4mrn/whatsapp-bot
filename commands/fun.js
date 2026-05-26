const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const quotes = [
    "El único modo de hacer un gran trabajo es amar lo que haces. - Steve Jobs",
    "La vida es lo que pasa mientras estás ocupado haciendo otros planes. - John Lennon",
    "No cuentes los días, haz que los días cuenten. - Muhammad Ali",
    "El éxito es ir de fracaso en fracaso sin perder el entusiasmo. - Winston Churchill",
    "La imaginación es más importante que el conocimiento. - Albert Einstein",
    "Sé el cambio que quieres ver en el mundo. - Mahatma Gandhi",
    "El único imposible es aquello que no intentas. - Anónimo",
    "Cree en ti mismo y todo será posible. - Anónimo",
    "El fracaso es la oportunidad de empezar de nuevo con más inteligencia. - Henry Ford",
    "La felicidad no es tener lo que quieres, sino querer lo que tienes. - Anónimo",
    "El conocimiento habla, pero la sabiduría escucha. - Jimi Hendrix",
    "No esperes. El momento nunca será perfecto. - Napoleon Hill",
    "Todo lo que puedes imaginar es real. - Pablo Picasso",
    "La mejor manera de predecir el futuro es crearlo. - Peter Drucker",
    "La vida es 10% lo que te sucede y 90% cómo reaccionas. - Charles R. Swindoll",
];

const insults = [
    "Eres la razón por la que pusieron instrucciones en el shampoo.",
    "Si la estupidez volara, estarías en la estratosfera.",
    "No eres tonto, lastima que el resto del mundo te hace parecerlo.",
    "Algún día serás alguien importante... en la fila del desempleo.",
    "Eres más denso que un agujero negro.",
    "Si el silencio es oro, tú eres millonario... cuando te callas.",
    "Tienes el coeficiente intelectual de una planta marchita.",
    "No te subestimes, eres capaz de cosas increíblemente estúpidas.",
    "Eres como las nubes: cuando desapareces, el día mejora.",
    "Si la belleza fuera tiempo, tú serías un año bisiesto... feo cada 4 años.",
];

async function sendGif(client, chatId, gifUrl, caption) {
    try {
        const { MessageMedia } = require('whatsapp-web.js');
        const response = await axios.get(gifUrl, { responseType: 'arraybuffer', timeout: 10000 });
        const buffer = Buffer.from(response.data);
        const media = new MessageMedia('image/gif', buffer.toString('base64'), 'action.gif');
        await client.sendMessage(chatId, media, { caption: caption });
        return true;
    } catch (e) {
        console.error('Error GIF:', e.message);
        return false;
    }
}

const eightBallAnswers = [
    "🎱 Sí, definitivamente.",
    "🎱 Es seguro.",
    "🎱 Sin duda.",
    "🎱 Sí, claro.",
    "🎱 Puedes confiar en ello.",
    "🎱 Como yo lo veo, sí.",
    "🎱 Probablemente.",
    "🎱 Las señales apuntan a que sí.",
    "🎱 No cuentes con ello.",
    "🎱 Mi respuesta es no.",
    "🎱 Mis fuentes dicen que no.",
    "🎱 Las perspectivas no son buenas.",
    "🎱 Muy dudoso.",
    "🎱 Pregunta de nuevo más tarde.",
    "🎱 Mejor no te lo digo ahora.",
    "🎱 No puedo predecirlo ahora.",
    "🎱 Concéntrate y pregunta de nuevo.",
];

async function randomQuote(client, message, chat) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    await message.reply(`💭 *Frase del momento*\n\n"${quote}"`);
}

async function randomMeme(client, message, chat) {
    try {
        const response = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });
        if (response.data && response.data.url) {
            const { MessageMedia } = require('whatsapp-web.js');
            const media = await MessageMedia.fromUrl(response.data.url);
            await client.sendMessage(chat.id._serialized, media, {
                caption: `😂 *Meme para ti*`
            });
        } else {
            await fallbackMeme(client, message, chat);
        }
    } catch (error) {
        console.error('Error en meme:', error);
        await fallbackMeme(client, message, chat);
    }
}

async function fallbackMeme(client, message, chat) {
    const fallbackMemes = [
        "https://i.imgur.com/1wCQ3AS.jpg",
        "https://i.imgur.com/2YQ5dsB.jpg",
        "https://i.imgur.com/3zR7eDc.jpg",
        "https://i.imgur.com/4aF8gHb.jpg",
        "https://i.imgur.com/5sJ9kLm.jpg"
    ];
    const url = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
    const { MessageMedia } = require('whatsapp-web.js');
    try {
        const media = await MessageMedia.fromUrl(url);
        await client.sendMessage(chat.id._serialized, media, { caption: '😂 *Meme*' });
    } catch {
        await message.reply('😂 No pude cargar un meme. Intenta de nuevo.');
    }
}

async function insult(client, message, chat, args) {
    if (args.length > 0) {
        const target = args.join(' ');
        const insultText = insults[Math.floor(Math.random() * insults.length)];
        await message.reply(`😤 *${target}*, ${insultText}`);
    } else {
        const insultText = insults[Math.floor(Math.random() * insults.length)];
        await message.reply(`😤 ${insultText}`);
    }
}

const gifActions = {
    hug: [
        "https://media1.tenor.com/m/0HlMHn2rIo0AAAAC/hug-cute.gif",
        "https://media1.tenor.com/m/Gr6U86wMxtMAAAAC/anime-hug.gif",
        "https://media1.tenor.com/m/GfUPthEkJPsAAAAC/hug.gif",
        "https://media1.tenor.com/m/xIuXbJ0KCG0AAAAd/hug.gif",
    ],
    kiss: [
        "https://media1.tenor.com/m/7wRXVF6uNScAAAAC/anime-kiss.gif",
        "https://media1.tenor.com/m/FaCAoFOLJToAAAAC/kiss-anime.gif",
        "https://media1.tenor.com/m/MfCOphRUoIsAAAAC/kiss-love.gif",
        "https://media1.tenor.com/m/JFahU5lD6dAAAAAd/anime-kiss.gif",
    ],
    slap: [
        "https://media1.tenor.com/m/7RqP0tKVVlgAAAAC/slap-hit.gif",
        "https://media1.tenor.com/m/u9o8GMCm_f4AAAAC/anime-slap.gif",
        "https://media1.tenor.com/m/73vMLxSf0-sAAAAC/slap.gif",
    ],
    pat: [
        "https://media1.tenor.com/m/8oBzJco0x2AAAAAC/pat-head-pat.gif",
        "https://media1.tenor.com/m/0Gf5pEGHA9AAAAAC/anime-pat.gif",
        "https://media1.tenor.com/m/VvFbTWAvCysAAAAC/head-pat.gif",
    ],
};

async function hug(client, message, chat, args) {
    const urls = gifActions.hug;
    const url = urls[Math.floor(Math.random() * urls.length)];
    const target = args.length > 0 ? args.join(' ') : 'todos';
    const sender = message.author?.split('@')[0] || 'Alguien';
    const caption = `🤗 *${sender}* le dio un abrazo a *${target}*`;
    const ok = await sendGif(client, chat.id._serialized, url, caption);
    if (!ok) await message.reply(caption + '\n(｡♡‿♡｡)');
}

async function kiss(client, message, chat, args) {
    const urls = gifActions.kiss;
    const url = urls[Math.floor(Math.random() * urls.length)];
    const target = args.length > 0 ? args.join(' ') : 'todos';
    const sender = message.author?.split('@')[0] || 'Alguien';
    const caption = `😘 *${sender}* le dio un beso a *${target}*`;
    const ok = await sendGif(client, chat.id._serialized, url, caption);
    if (!ok) await message.reply(caption + '\n( ˘ ³˘)♥');
}

async function slap(client, message, chat, args) {
    const urls = gifActions.slap;
    const url = urls[Math.floor(Math.random() * urls.length)];
    const target = args.length > 0 ? args.join(' ') : 'todos';
    const sender = message.author?.split('@')[0] || 'Alguien';
    const caption = `✋ *${sender}* le dio una cachetada a *${target}*`;
    const ok = await sendGif(client, chat.id._serialized, url, caption);
    if (!ok) await message.reply(caption + '\n(╯°□°)╯');
}

async function pat(client, message, chat, args) {
    const urls = gifActions.pat;
    const url = urls[Math.floor(Math.random() * urls.length)];
    const target = args.length > 0 ? args.join(' ') : 'todos';
    const sender = message.author?.split('@')[0] || 'Alguien';
    const caption = `🖐 *${sender}* acarició a *${target}*`;
    const ok = await sendGif(client, chat.id._serialized, url, caption);
    if (!ok) await message.reply(caption + '\n(´･ω･`)');
}

async function calculate(client, message, chat, expression) {
    try {
        let sanitized = expression
            .replace(/x/g, '*')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/,/g, '.');

        const allowed = /^[\d+\-*/().%\s]+$/;
        if (!allowed.test(sanitized)) {
            await message.reply('❌ La expresión contiene caracteres no permitidos.');
            return;
        }

        const result = Function(`"use strict"; return (${sanitized})`)();
        await message.reply(`🧮 *Calculadora*\n\n${expression} = *${result}*`);
    } catch (error) {
        await message.reply('❌ Error al calcular. Verifica la expresión.\nEjemplo: !calcular (5+3)*2');
    }
}

async function translate(client, message, chat, args) {
    const lang = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    const langCodes = {
        en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch',
        it: 'Italiano', pt: 'Português', ja: '日本語', ko: '한국어',
        zh: '中文', ru: 'Русский', ar: 'العربية', hi: 'हिन्दी',
        nl: 'Nederlands', pl: 'Polski', sv: 'Svenska', tr: 'Türkçe'
    };

    if (!langCodes[lang]) {
        const available = Object.entries(langCodes).map(([k, v]) => `${k} = ${v}`).join('\n');
        await message.reply(`❌ Idioma no soportado.\nCódigos disponibles:\n${available}`);
        return;
    }

    try {
        const response = await axios.get(`https://api.mymemory.translated.net/get`, {
            params: { q: text, langpair: `es|${lang}` },
            timeout: 10000
        });

        if (response.data && response.data.responseData) {
            const translated = response.data.responseData.translatedText;
            await message.reply(
                `🌐 *Traducción*\n\n` +
                `📝 *Original:* ${text}\n` +
                `➡️ *${langCodes[lang]}:* ${translated}`
            );
        } else {
            await message.reply('❌ No se pudo traducir. Intenta de nuevo.');
        }
    } catch (error) {
        console.error('Error en translate:', error);
        await message.reply('❌ Error de traducción. Verifica tu conexión.');
    }
}

async function eightBall(client, message, chat, question) {
    const answer = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
    await message.reply(`🔮 *Bola 8 Mágica*\n\n❓ *Pregunta:* ${question}\n\n${answer}`);
}

module.exports = { randomQuote, randomMeme, insult, hug, kiss, slap, pat, calculate, translate, eightBall };
