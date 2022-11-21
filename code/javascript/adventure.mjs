import * as readlinePromises from 'node:readline/promises';
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });


const HAND_OF_GOOD_ACTIONS = {
    teleport: (playerInput) => {
        const locationID = playerInput.split(" ")[1];
        const location = findScene(locationID, gameScenarios);
        if (location) {
            scene = location;
            currentDescription = scene.description;
        } else {
            currentDescription = "Who do you think you are? The Wizzard of Oz?"
        }
    },
    manapotion: (playerInput) => {
        player.hp += 250;
        currentDescription = "You down a strange luiquide, you gain 250 HP and a strange glow"
        player.glow = true;
    }
}

const player = {
    hp: 200,
}
const stateInfo = {}
const bagOfHolding = {}
const gameScenarios = [
    {
        id: "start",
        description: "You are standing in a classroom, there is a door to your left",
        subjects: {
            door: {
                status: "Closed",
                go: {
                    descriptionClosed: "The door is closed",
                    effect: (subject) => {
                        if (subject.status === "Open" || subject.status === "Broken") {
                            const sceneID = "hallway"
                            scene = findScene(sceneID, gameScenarios);
                            if (scene === null) {
                                console.log("No such scene " + sceneID)
                                process.exit();
                            }
                            currentDescription = scene.description;
                        }
                    }
                },
                open: {
                    descriptionClosed: "The door is now open",
                    descriptionOpen: "The door is allready oppen",
                    effect: (subject) => { subject.status = "Open" }
                },
                kick: {
                    descriptionClosed: "Door is of poor quality and even though you are a weakling, it brakes a part.",
                    descriptionOpen: "Kicking an open door does nothing",
                    descriptionBroken: "You mighty stud, you pulverise the already broken door",
                    effect: (subject) => { subject.status = "Broken" }
                }
            }
        }
    },
    {
        id: "hallway",
        description: "You walk into a long dark coridor, there is a strange smell and a mysterious sound coming from the dark..",
        subjects: {
            monster: {
                status: "Live",
                hp: 200,
                kick: {
                    description: "The monster grunts",
                    effect: (subject) => {
                        const event = Math.random() * 10;
                        if (event > 9.5) {
                            subject.hp = 0;
                            subject.status = "Dead"
                            subject.kick.description = "Natural 20, you kick the monster through a wall and the building colapses on top of it"
                        } else if (event > 0.5) {
                            subject.hp -= 20;
                        } else {
                            player.hp -= Math.floor(Math.random() * 40) + 10;
                            subject.kick.description = "The monster gets enoyd and bites of your arm."
                        }

                    }
                }
            }
        }
    }
]

const ACTIONS = [
    "go",
    "kick",
    "open",
    "teleport",
    "manapotion",
]

let scene = gameScenarios[0];
let currentDescription = scene.description;
let isPlaying = true;
let input = "";

while (isPlaying) {

    if (input !== "") {
        // Håndtere det spilleren har gjort.
        let action = extractAction(input, ACTIONS);
        let subject = extractSubject(input, Object.keys(scene.subjects));

        if (action === null) {
            currentDescription = `I dont understand ${input}`;
        }

        if (HAND_OF_GOOD_ACTIONS[action] !== undefined) {
            HAND_OF_GOOD_ACTIONS[action](input);
        }

        if (scene.subjects[subject] !== undefined) {
            subject = scene.subjects[subject];
            if (subject[action]) {
                currentDescription = subject[action]["description" + subject.status];
                if (currentDescription === undefined) {
                    currentDescription = "You cant do that";
                }
                subject[action].effect(subject);
            }
        }

    }
    console.log(currentDescription);
    // Hva vill du gjøre nå?
    input = await rl.question("> ");
    input = cleanUserInput(input);
    currentDescription = "";
}

function findScene(nameOFScene, scenes) {
    let foundScene = null;
    for (const sc of scenes) {
        if (sc.id === nameOFScene) {
            foundScene = sc;
            break;
        }
    }
    return foundScene;
}

function extractSubject(userInput, possibleSubjects) {
    const segments = userInput.split(" ");
    let subject = null;
    for (const sub of possibleSubjects) {
        for (const segment of segments) {
            if (segment === sub) {
                subject = sub;
                break;
            }
        }
    }
    return subject;
}

function extractAction(userInput, actions) {
    const segments = userInput.split(" ");
    let action = null;
    for (const ac of actions) {
        for (const segment of segments) {
            if (segment === ac) {
                action = ac;
                break;
            }
        }
    }
    return action;
}

function cleanUserInput(userInput) {
    //     WEST west West WesT --> west 
    return userInput.trim().toLowerCase()
}