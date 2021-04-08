const Discord = require('discord.js');
const client = new Discord.Client();
const unirest = require("unirest");
const friendId = "YOUR-FRIEND-ID";
const botToken = "YOUR-TOKEN-HERE";

client.on('ready', () => {
    console.log(`🚀 Connecté en tant que ${client.user.tag}!`);
});

client.on('message', msg => {

    if (msg.author == client.user || msg.author.id != friendId) return;
    let chan = msg.channel;
    let req = unirest("POST", "https://languagetool.org/api/v2/check");

    req.query({
        "text": `${msg.content}`,
        "language": "fr",
        "enabledOnly": false

    });

    req.headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    });


    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        let response = res.body.matches;
        let nbrFautes = 0;
        response.forEach(faute => nbrFautes++);

        if (nbrFautes == 1) {
            chan.send("Tu as fais une faute dans cette phrase : " + response[0].sentence)
            response.forEach(word => {
                if (response[0].replacements[0]) {
                    if (word.message == "Possible spelling mistake found.") {
                        chan.send("Elle s'écrit plutôt comme ça : " + word.replacements[0].value)
                    }
                    else {
                        chan.send(word.message)
                    }
                }
                else {
                    chan.send("Mais je ne sais pas où exactement");
                }
            })
        }
        else if (nbrFautes > 1) {
            chan.send("Tu as fais plusieurs fautes dans cette phrase : " + response[0].sentence)

            response.forEach(word => {
                if (word.message == "Possible spelling mistake found.") {
                    if (word.replacements[0]) {
                        chan.send("Une de tes fautes s'écrit plutôt comme ça : " + word.replacements[0].value)
                    } else { chan.send("Je n'arrive pas à cerner une de tes fautes mais elle est bien présente") }
                }
                else {
                    chan.send(word.message)
                }
            })
        }
    });


});

client.login(botToken);
