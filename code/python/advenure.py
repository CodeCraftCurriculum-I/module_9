stateInfo = {}
bagOfHolding = {}
player = {"hp": 200}
scene = None
currentDescription = None
isPlaying = True
userInput = ""


def findScene(nameOFScene, scenes):
    foundScene = None
    for sc in scenes:
        if sc.get("id") == nameOFScene:
            foundScene = sc
            break

    return foundScene


def extractSubject(userInput, possibleSubjects):
    segments = userInput.split(" ")
    subject = None
    for sub in possibleSubjects:
        for segment in segments:
            if segment == sub:
                subject = sub
                break

    return subject


def extractAction(userInput, actions):
    segments = userInput.split(" ")
    action = None
    for ac in actions:
        for segment in segments:
            if segment == ac:
                action = ac
                break

    return action


def cleanUserInput(userInput):
    # WEST west West WesT - -> west
    return userInput.strip().lower()


def setAttributOfObjectToValue(obj, attr, val):
    obj[attr] = val


def changeScene(subject, conditions, target, scenarios):
    global currentDescription
    conditionsOK = False

    for condition in conditions:
        if subject[condition["key"]] == condition["value"]:
            conditionsOK = True
            break

    if conditionsOK == False:
        return

    scene = findScene(target, scenarios)
    if scene == None:
        print("No such scene " + target)
        SystemExit()

    currentDescription = scene["description"]


def drinkMana():
    global player, currentDescription
    player["hp"] += 250
    player["glow"] = True
    currentDescription = "You down a strange luiquide, you gain 250 HP and a strange glow"


def teleport(playerInput):
    global scene, currentDescription
    locationID = playerInput.split(" ")[1]
    location = findScene(locationID, gameScenarios)
    if location != None:
        scene = location
        currentDescription = scene.get("description")
    else:
        currentDescription = "Who do you think you are? The Wizzard of Oz?"


gameScenarios = [
    {
        "id": "start",
        "description": "You are standing in a classroom, there is a door to your left",
        "subjects": {
            "door": {
                "status": "Closed",
                "go": {
                    "descriptionClosed": "The door is closed",
                    "effect": lambda subject: changeScene(subject, [{"key": "status", "value": "Open"}, {"key": "status", "value": "Broken"}], "hallway", gameScenarios)
                },
                "open": {
                    "descriptionClosed": "The door is now open",
                    "descriptionOpen": "The door is allready oppen",
                    "effect": lambda subject: setAttributOfObjectToValue(subject, "status", "Open"),
                },
                "kick": {
                    "descriptionClosed": "Door is of poor quality and even though you are a weakling, it brakes a part.",
                    "descriptionOpen": "Kicking an open door does nothing",
                    "descriptionBroken": "You mighty stud, you pulverise the already broken door",
                    "effect": lambda subject: setAttributOfObjectToValue(subject, "status", "Broken")
                }
            }
        }
    },
    {
        "id": "hallway",
        "description": "You walk into a long dark coridor, there is a strange smell and a mysterious sound coming from the dark..",
        "subjects": {
            "monster": {
                "status": "Live",
                "hp": 200,
                "kick": {
                    "description": "The monster grunts",
                    "effect": None
                }
            }
        }
    }
]


HAND_OF_GOOD_ACTIONS = {
    "teleport": lambda playerInput: teleport(playerInput),
    "manapotion": lambda playerInput: drinkMana(),
}


ACTIONS = [
    "go",
    "kick",
    "open",
    "teleport",
    "manapotion",
]


scene = gameScenarios[0]
currentDescription = scene["description"]

while (isPlaying):

    if userInput != "":
        action = extractAction(userInput, ACTIONS)
        subject = extractSubject(userInput, scene["subjects"].keys())

        if action == None:
            currentDescription = f"I dont understand {userInput}"

        if HAND_OF_GOOD_ACTIONS.get(action) != None:
            HAND_OF_GOOD_ACTIONS[action](userInput)

        if scene["subjects"].get(subject) != None:

            subject = scene.get("subjects").get(subject)

            if (subject.get(action) != None):

                currentDescription = subject[action].get(
                    "description" + subject.get("status"))

                if currentDescription == None:
                    currentDescription = "You cant do that"

                subject[action]["effect"](subject)

    print(currentDescription)
    # Hva vill du gjøre nå?
    userInput = input("> ")
    userInput = cleanUserInput(userInput)
    currentDescription = ""
