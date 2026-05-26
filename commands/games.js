const axios = require('axios');

async function dice(client, message, chat) {
    const result = Math.floor(Math.random() * 6) + 1;
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    await message.reply(`🎲 *Dado*\n\nResultado: ${diceFaces[result - 1]} *${result}*`);
}

async function coinFlip(client, message, chat) {
    const result = Math.random() < 0.5 ? 'Cara' : 'Sello';
    const emoji = result === 'Cara' ? '🪙' : '🪙';
    await message.reply(`${emoji} *Lanzamiento de moneda*\n\nResultado: *${result}*`);
}

async function rps(client, message, chat, args) {
    const choices = ['piedra', 'papel', 'tijera'];
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
        await message.reply('❌ Uso: !ppt <piedra|papel|tijera>');
        return;
    }

    const botChoice = choices[Math.floor(Math.random() * 3)];
    const emojis = { piedra: '🪨', papel: '📄', tijera: '✂️' };

    let result;
    if (userChoice === botChoice) {
        result = '🤝 *Empate!*';
    } else if (
        (userChoice === 'piedra' && botChoice === 'tijera') ||
        (userChoice === 'papel' && botChoice === 'piedra') ||
        (userChoice === 'tijera' && botChoice === 'papel')
    ) {
        result = '🎉 *Ganaste!*';
    } else {
        result = '😞 *Perdiste!*';
    }

    await message.reply(
        `✂️📄🪨 *Piedra, Papel o Tijera*\n\n` +
        `Tú: ${emojis[userChoice]} ${userChoice}\n` +
        `Bot: ${emojis[botChoice]} ${botChoice}\n\n` +
        `${result}`
    );
}

async function randomNumber(client, message, chat, args) {
    const min = parseInt(args[0]);
    const max = parseInt(args[1]);

    if (isNaN(min) || isNaN(max) || min >= max) {
        await message.reply('❌ Uso: !numero <min> <max>\nEjemplo: !numero 1 100');
        return;
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    await message.reply(`🔢 *Número aleatorio*\n\nRango: ${min} - ${max}\nResultado: *${result}*`);
}

async function trivia(client, message, chat) {
    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple&lang=es');
        const data = response.data;

        if (data.response_code !== 0 || !data.results.length) {
            await message.reply('❌ No se pudo obtener una trivia. Intenta de nuevo.');
            return;
        }

        const question = data.results[0];
        const answers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(answers);

        const correctIndex = answers.indexOf(question.correct_answer);
        const letterMap = ['A', 'B', 'C', 'D'];

        let triviaMsg = `🧠 *Trivia*\n\n` +
            `📚 *Categoría:* ${question.category}\n` +
            `📝 *Dificultad:* ${question.difficulty}\n\n` +
            `*${decodeHtml(question.question)}*\n\n`;

        answers.forEach((answer, i) => {
            triviaMsg += `${letterMap[i]}) ${decodeHtml(answer)}\n`;
        });

        triviaMsg += `\n🔄 La respuesta correcta se revelará pronto...`;

        const sentMsg = await message.reply(triviaMsg);

        setTimeout(async () => {
            const correctAnswer = decodeHtml(question.correct_answer);
            await message.reply(`✅ *Respuesta correcta:* ${correctAnswer}`);
        }, 15000);

    } catch (error) {
        console.error('Error en trivia:', error);
        await message.reply('❌ Error al obtener trivia. Intenta más tarde.');
    }
}

async function horoscope(client, message, chat, signo) {
    const signos = {
        aries: '♈ Aries (21 Mar - 19 Abr)',
        tauro: '♉ Tauro (20 Abr - 20 May)',
        geminis: '♊ Géminis (21 May - 20 Jun)',
        cancer: '♋ Cáncer (21 Jun - 22 Jul)',
        leo: '♌ Leo (23 Jul - 22 Ago)',
        virgo: '♍ Virgo (23 Ago - 22 Sep)',
        libra: '♎ Libra (23 Sep - 22 Oct)',
        escorpio: '♏ Escorpio (23 Oct - 21 Nov)',
        sagitario: '♐ Sagitario (22 Nov - 21 Dic)',
        capricornio: '♑ Capricornio (22 Dic - 19 Ene)',
        acuario: '♒ Acuario (20 Ene - 18 Feb)',
        piscis: '♓ Piscis (19 Feb - 20 Mar)'
    };

    const signoLower = signo.toLowerCase();
    if (!signos[signoLower]) {
        const lista = Object.keys(signos).join(', ');
        await message.reply(`❌ Signo no válido. Signos disponibles:\n${lista}`);
        return;
    }

    const predicciones = [
        "Hoy es un gran día para tomar decisiones importantes. El universo está de tu lado.",
        "Las estrellas te sonríen. Aprovecha para conectar con tus seres queridos.",
        "Un cambio inesperado podría traer grandes oportunidades. Mantén la mente abierta.",
        "La energía positiva te rodea. Es momento de perseguir tus sueños.",
        "Cuida tu salud hoy. Un pequeño descanso hará una gran diferencia.",
        "Las relaciones brillan bajo esta alineación estelar. Comunica tus sentimientos.",
        "Nuevas oportunidades laborales se presentarán. Mantén tus ojos abiertos.",
        "La creatividad fluye hoy. Aprovecha para expresarte.",
        "Un viejo amigo podría contactarte. La amistad es tu fortaleza hoy.",
        "La paciencia será tu mejor aliada. Todo llega a su debido tiempo."
    ];

    const prediccion = predicciones[Math.floor(Math.random() * predicciones.length)];

    await message.reply(
        `🔮 *Horóscopo*\n\n` +
        `${signos[signoLower]}\n\n` +
        `📜 *Predicción:*\n${prediccion}\n\n` +
        `✨ Que tengas un excelente día!`
    );
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function decodeHtml(html) {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&iacute;/g, 'í')
        .replace(/&oacute;/g, 'ó')
        .replace(/&uacute;/g, 'ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Aacute;/g, 'Á')
        .replace(/&Eacute;/g, 'É')
        .replace(/&Iacute;/g, 'Í')
        .replace(/&Oacute;/g, 'Ó')
        .replace(/&Uacute;/g, 'Ú')
        .replace(/&Ntilde;/g, 'Ñ');
}

module.exports = { dice, coinFlip, rps, randomNumber, trivia, horoscope };
