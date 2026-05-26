const config = require('../config/config');

async function announce(client, message, chat, text) {
    try {
        const announceMsg = `📢 *ANUNCIO* 📢\n\n${text}\n\n━ ${config.botName}`;
        await message.reply(announceMsg);
    } catch (error) {
        console.error('Error en announce:', error);
        await message.reply('❌ Error al enviar el anuncio.');
    }
}

async function clearChat(client, message, chat) {
    try {
        const msgs = await chat.fetchMessages({ limit: 100 });
        const botMsg = await message.reply('🧹 Limpiando mensajes...');

        let deleted = 0;
        for (const msg of msgs) {
            if (msg.fromMe || msg.author === message.from) {
                try {
                    await msg.delete(true);
                    deleted++;
                } catch (e) {
                    // Continue
                }
            }
        }

        await botMsg.edit(`🧹 *Limpieza completada*\nEliminados: ${deleted} mensajes`);
    } catch (error) {
        console.error('Error en clear:', error);
        await message.reply('❌ Error al limpiar. WhatsApp solo permite borrar mensajes recientes.');
    }
}

async function banMember(client, message, chat, args) {
    try {
        if (!chat.isGroup) {
            await message.reply('❌ Este comando solo funciona en grupos.');
            return;
        }

        const mentions = await message.getMentions();
        if (mentions.length === 0) {
            await message.reply('❌ Menciona al usuario que deseas vetar.\nEjemplo: !ban @usuario');
            return;
        }

        const target = mentions[0];
        await chat.removeParticipants([target.id._serialized]);
        await message.reply(`🚫 *${target.pushname || target.number}* ha sido vetado del grupo.`);
    } catch (error) {
        console.error('Error en ban:', error);
        await message.reply('❌ No pude vetar al usuario. Asegúrate de ser admin.');
    }
}

async function kickMember(client, message, chat, args) {
    try {
        if (!chat.isGroup) {
            await message.reply('❌ Este comando solo funciona en grupos.');
            return;
        }

        const mentions = await message.getMentions();
        if (mentions.length === 0) {
            await message.reply('❌ Menciona al usuario que deseas expulsar.\nEjemplo: !kick @usuario');
            return;
        }

        const target = mentions[0];
        await chat.removeParticipants([target.id._serialized]);
        await message.reply(`👢 *${target.pushname || target.number}* ha sido expulsado del grupo.`);
    } catch (error) {
        console.error('Error en kick:', error);
        await message.reply('❌ No pude expulsar al usuario. Asegúrate de ser admin.');
    }
}

module.exports = { announce, clearChat, banMember, kickMember };
