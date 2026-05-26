const config = require('../config/config');

async function sendMenu(client, message, chat, config) {
    const menu = `🤖 *${config.botName}* - Comandos

🎵 *MUSICA*
!play <canción> - Busca y reproduce audio
!stop - Detener música
!skip - Saltar canción
!queue - Ver cola
!np - Canción actual

🎮 *JUEGOS*
!dado - Tirar dado
!moneda - Cara o sello
!ppt <piedra/papel/tijera>
!numero <min> <max>
!trivia - Pregunta aleatoria
!horoscopo <signo>

😂 *DIVERSIÓN*
!frase - Frase motivadora
!meme - Meme random
!insulto <@user>
!abrazar <@user>
!besar <@user>
!cachetear <@user>
!acariciar <@user>
!calcular <expr>
!traducir <lang> <txt>
!decir <texto>
!8ball <pregunta>

🔧 *HERRAMIENTAS*
!wiki <término> - Wikipedia
!clima <ciudad>
!contraseña <long>
!qr <texto>
!acortar <url>
!definir <palabra>
!ip [dirección]
!letra <artista - canción>

⚙️ *ADMIN*
!anuncio <mensaje>
!limpiar
!ban <@user>
!kick <@user>

ℹ️ *OTROS*
!menu - Este menú
!info - Info del bot
!ping - Latencia`;

    await message.reply(menu);
}

module.exports = { sendMenu };
