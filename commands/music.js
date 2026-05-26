const ytSearch = require('yt-search');
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const config = require('../config/config');

const musicQueue = new Map();
const ffmpegPath = ffmpeg.path;
const ffprobePath = ffmpegPath.replace('ffmpeg.exe', 'ffprobe.exe');

async function play(client, message, chat, args) {
    if (!args[0]) {
        await message.reply('❌ Uso: !play <nombre de canción>\nEjemplo: !play Imagine Dragons Believer');
        return;
    }

    const query = args.join(' ');
    const chatId = chat.id._serialized;

    const statusMsg = await message.reply(`🔍 Buscando: *${query}*...`);

    try {
        const searchResult = await ytSearch(query);
        if (!searchResult.videos.length) {
            await message.reply('❌ No se encontraron resultados.');
            return;
        }

        const video = searchResult.videos[0];
        const videoUrl = video.url;

        const song = {
            title: video.title,
            url: videoUrl,
            duration: formatDuration(video.duration?.seconds || video.duration || 0),
            thumbnail: video.thumbnail,
            channel: video.author?.name || video.channel?.name || 'Desconocido',
            views: formatViews(video.views),
            requester: message.author || message.from,
            chatId: chatId
        };

        if (!musicQueue.has(chatId)) {
            musicQueue.set(chatId, []);
        }
        const chatQueue = musicQueue.get(chatId);
        chatQueue.push(song);

        const infoMsg = `🎵 *${song.title}*\n` +
            `👤 ${song.channel}\n` +
            `⏱ ${song.duration} | 👁 ${song.views}\n` +
            `📍 Cola: #${chatQueue.length}`;

        if (chatQueue.length === 1) {
            await message.reply(infoMsg);
            await playSong(client, message, chat, chatId, song);
        } else {
            await message.reply(`✅ *Agregado a la cola* (Posición #${chatQueue.length})\n\n${infoMsg}`);
        }

    } catch (error) {
        console.error('Error en play:', error);
        await message.reply('❌ Error al buscar la canción: ' + error.message);
    }
}

async function playSong(client, message, chat, chatId, song) {
    const tempDir = './temp';
    await fs.ensureDir(tempDir);
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);

    try {
        await message.reply(`⬇️ Descargando: *${song.title}*...`);

        await youtubedl(song.url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: filePath,
            quiet: true,
            noWarnings: true,
            ffmpegLocation: ffmpegPath,
        });

        const stats = fs.statSync(filePath);
        if (stats.size < 1000) {
            throw new Error('Archivo demasiado pequeño');
        }

        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(chatId, media, {
            sendAudioAsVoice: true,
            caption: `🎵 *${song.title}*\n👤 ${song.channel}\n⏱ ${song.duration}`
        });

        await fs.remove(filePath);

        const chatQueue = musicQueue.get(chatId);
        if (chatQueue && chatQueue.length > 0) {
            chatQueue.shift();
            if (chatQueue.length > 0) {
                setTimeout(() => playSong(client, message, chat, chatId, chatQueue[0]), 2000);
            } else {
                musicQueue.delete(chatId);
                await client.sendMessage(chatId, '✅ Reproducción finalizada.');
            }
        }

    } catch (error) {
        console.error('Error reproduciendo:', error);
        await fs.remove(filePath).catch(() => {});
        const chatQueue = musicQueue.get(chatId);
        if (chatQueue && chatQueue.length > 0) {
            chatQueue.shift();
            if (chatQueue.length > 0) {
                await message.reply('⚠ Error en una canción, pasando a la siguiente...');
                playSong(client, message, chat, chatId, chatQueue[0]);
            } else {
                musicQueue.delete(chatId);
                await message.reply('❌ Error al reproducir. Cola vacía.');
            }
        }
    }
}

async function stop(client, message, chat) {
    musicQueue.delete(chat.id._serialized);
    await message.reply('⏹ Reproducción detenida.');
}

async function skip(client, message, chat) {
    const chatQueue = musicQueue.get(chat.id._serialized);
    if (!chatQueue || chatQueue.length <= 1) {
        await message.reply('❌ No hay siguiente canción.');
        return;
    }
    chatQueue.shift();
    await message.reply('⏭ Canción saltada.');
}

async function queue(client, message, chat) {
    const chatQueue = musicQueue.get(chat.id._serialized);
    if (!chatQueue || chatQueue.length === 0) {
        await message.reply('📭 Cola vacía.');
        return;
    }
    let msg = `🎵 *Cola* (${chatQueue.length})\n\n`;
    chatQueue.forEach((s, i) => {
        msg += `${i === 0 ? '🔊' : '#' + (i + 1)} ${s.title} (${s.duration})\n`;
    });
    if (msg.length > 4000) msg = msg.substring(0, 3970) + '\n...';
    await message.reply(msg);
}

async function nowPlaying(client, message, chat) {
    const chatQueue = musicQueue.get(chat.id._serialized);
    if (!chatQueue || chatQueue.length === 0) {
        await message.reply('📭 No hay música reproduciéndose.');
        return;
    }
    const s = chatQueue[0];
    await message.reply(`🔊 *Reproduciendo:* 🎵 ${s.title}\n👤 ${s.channel}\n⏱ ${s.duration}`);
}

async function setVolume(client, message, chat, args) {
    await message.reply('⚠ El volumen no se controla desde WhatsApp.');
}

function formatDuration(sec) {
    if (!sec && sec !== 0) return '0:00';
    const s = parseInt(sec);
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss.toString().padStart(2, '0')}`;
}

function formatViews(views) {
    if (!views) return 'N/A';
    const n = parseInt(views);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

module.exports = { play, stop, skip, queue, nowPlaying, setVolume };
