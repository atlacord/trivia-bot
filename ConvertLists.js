const fs = require('fs');
const path = require('path');
const util = require('util');

const IMAGE_REGEX = /(http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)/gm

async function convertTriviaFiles(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);

        const files = [];

        if (fs.statSync(filePath).isFile()) {
            let parsedQuestions = [];
            const content = fs.readFileSync(filePath, 'utf8');
            files.push(file.slice(0, -4));

            content.replaceAll(/[\r]+/gm, '');

            const lines = content.split('\n');
            console.log(lines);
            for (const l of lines) {
                l.replace(`'`, `\'`);
                let s = l.split('`');
                for (let i in s) {
                    s[i] = s[i].replaceAll('\r', '');
                }

                let image = l.match(IMAGE_REGEX);

                let payload = {
                    question: s[0],
                    answers: [...s.slice(1)]
                };

                if (image !== null) {
                    payload.image = image[0]
                    payload.question = payload.question.replace(IMAGE_REGEX, '')
                };

                parsedQuestions.push(payload)
            };
            console.log(parsedQuestions);
            fs.writeFileSync(`src/lib/trivia/lists/${file.slice(0, -4)}.ts`, `export const ${file.slice(0, -4)} = { name: '${file.slice(0, -4)}', content: ${util.inspect(parsedQuestions, { maxArrayLength: Infinity, depth: Infinity, compact: false })}}`)
        }
    })
}

(async () => { await convertTriviaFiles('triviaLists') })()