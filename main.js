const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const itemSelectDisplay = document.getElementById("itemSelectedDisplay")

let ItemsDrops = []
let Player = JSON.parse(localStorage.getItem("Player")) || {
    pos: {
        x: 68,
        y: 60
    },
    itemSelect: {
        type: "unSelect",
        name: "unSelect",
        id: 0
    },
    positionMap: "lobby",
    tam: {
        h: 48,
        w: 24
    },
    id: null,
    dir: "left",
    inv: [
        {
            id: 0,
            cant: 2
        },
        {
            id: 1,
            cant: 1
        }
    ],
    accesory: [],
    preside: {
        days: null,
        dayTranscurse: 0
    },
    speed: 2
};
if(Player.inv.length > 0) {
    itemSelectDisplay.innerHTML = `<img src="${Items[Player.inv[Player.itemSelect.id].id].sprite}">`
}
const inventory = {
    craftDiv: document.getElementById("craft"),
    coockDiv: document.getElementById("coock"),
    chestDiv: document.getElementById("chest"),
    itemsDiv: document.getElementById("items"),
    inventoryDiv: document.getElementById("inventory"),
    inventoryOpen: false,
    restore() {
        if(Player.inv.length > 0) {
            itemSelectDisplay.innerHTML = `<img src="${Items[Player.inv[Player.itemSelect.id].id].sprite}">`
        }
        inventory.craftDiv.style.display = "none"
        inventory.coockDiv.style.display = "none"
        inventory.chestDiv.style.display = "none"
        inventory.itemsDiv.style.display = "none"
        inventory.inventoryDiv.style.display = "none"
        inventory.isOpen = false
        inventory.refresh()
    },
    openClose() {
        if(menuOpen) return
        itemSelectDisplay.innerHTML = `<img src="${Items[Player.inv[Player.itemSelect.id].id].sprite}">`
        if(inventory.isOpen) inventory.restore()
        else inventory.open()
        inventory.refresh()
    },
    open(crafting, chest) {
        if(Player.inv.length > 0) {
            itemSelectDisplay.innerHTML = `<img src="${Items[Player.inv[Player.itemSelect.id].id].sprite}">`
        }
        if(inventory.isOpen) inventory.restore()
        inventory.isOpen = true
        inventory.inventoryDiv.style.display = "block"
        let items = Player.inv
        let html = ""
        
        for(let i = 0; i < items.length; i++){
            let item = items[i]
            let I = Items[item.id]
            if(Player.itemSelect.id === i) {
                html+=`<div class='itemSelected'><p style="position: absolute;">${item.cant}</p><img src="${I.sprite}"></div>`
            } else {
                html+=`<div onclick="selectItem(${i})" class='item'><p style="position: absolute;">${item.cant}</p><img src="${I.sprite}"></div>`
            }
        }
        inventory.itemsDiv.innerHTML = html
        inventory.itemsDiv.style.display = "block"
        if(crafting !== false && crafting) {
            let b = World[crafting]
            let block = Blocks[b.id]
            
            if(block.craftType === "craft") {
                inventory.craftDiv.style.display = "block"
            } else if(block.craftType === "coock") {
                inventory.coockDiv.style.display = "block"
            } else if(block.style.display === "chest") {
                inventory.itemsDiv.style.display = "block"
            }
        }
        inventory.refresh()
    },
    refresh() {
        let Inv = Player.inv
    
        let groups = []
    
        Inv.forEach(item=>{
            let inner = false
            groups.forEach(itemGroup=>{
                if(itemGroup.id === item.id) {
                    inner = true
                    itemGroup.cant+=item.cant
                }
            })
            if(!inner) {
                groups.push(item)
            }
        })
        
        groups.forEach(items=>{
            if(items.cant >= 129) {
                dropItems(items.cant - 128, items)
                items.cant = 128
            }
        })
        
        Player.inv = groups
    }
}
inventory.restore()
const Commands = {
    apresar(r) {
        changueWorld(MapGeneral.prision, "prision")
        Commands.teletrans(123, 63)
        let alerta = ""
        let sentencia = ""
        if(r === "acoso") {
            alerta+="acoso a un jugador"
            sentencia+="12 dias"
            Player.preside.days = 12
        }
        if(r === "agresion") {
            alerta+="agresion"
            sentencia+="24 dias"
            Player.preside.days = 24
        }
        if(r) tox.dialogue("Sistema", `As sido enviado a presidio por ${alerta} durante ${sentencia}`)
        else tox.error(`As sido enviado a prision sin motivo aparente, puedes reportarlo si no hay motivo alguno para ser enviado.`)
    },
    teletrans(x, y) {
        Player.pos.x = x
        Player.pos.y = y - Player.tam.h / 2
    },
    sleepForce() {
        tox.dialogue("Sistema", "Te as quedado dormido. Deberias cuidarte mas...")
        game.calendary.horasD = "am"
        game.calendary.horas = 7
        game.calendary.minutos = 0
        game.calendary.dias++
        diaAct++
        resetNPCs()
        changueWorld(MapGeneral.lobby, "lobby")
        Commands.teletrans(112, 80)
    },
    sleep() {
        resetNPCs()
        game.calendary.horasD = "am"
        game.calendary.horas = 6
        game.calendary.minutos = 58
        game.calendary.dias++
        diaAct++
    },
    give(id, cant) {
        let itemGive = false
        Player.inv.forEach(item=>{
            if(id === item.id) {
                item.cant+=cant
                itemGive = true
            }
        })
        if(!itemGive) {
            Player.inv.push({
                id: id,
                cant: cant
            })
        }
        inventory.refresh()
    }
}

let Jugadores = {}; 

if (window.db) {
    window.fb.onSnapshot(window.fb.collection(window.db, "users"), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const id = change.doc.id;
            const data = change.doc.data();

            if (id !== Player.idPlayer) {
                if (change.type === "removed") {
                    delete Jugadores[id];
                } else {
                    Jugadores[id] = data;
                }
            }
        });
    });
}

function interact() {
    let d = Player.dir
    let interacted = false
    for(let i = 0; i < World.lenght; i++) {
        let t = World[i]
        let tx = t.pos.x
        let ty = t.pos.y
        let th = Blocks[t.id].tam.h
        let tw = Blocks[t.id].tam.w
        let px = Player.pos.x
        let py = Player.pos.y
        if(d === "down") {
            if(tx >= px && tx + tw >= px) {
                if(ty <= py && ty + Player.tam.h > py) {
                    if(Blocks[t.id].type == "craftingTable") {
                        inventory.restore()
                        inventory.open(i, false)
                        interacted = true
                    } else if(Blocks[t.id].type === "cofre") {
                        inventory.restore()
                        inventory.open(false, i)
                        interacted = true
                    }
                }
            }
        }
    }
    if(!interacted) {
        if(Player.itemSelect.type === "Arma blanca") {
            attack()
        }
    }
}
let attackKooldown = 0
setInterval(attackKooldown--, 1000)
function attack() {
    if(attackKooldown > 0) return
    console.log("Almenos funciona... ¡I no explota! ... creo...")
    attackKooldown = Player.itemSelect.attackKooldown
}

function selectItem(id) {
    itemSelectDisplay.innerHTML = `<img src="${Items[Player.inv[Player.itemSelect.id].id].sprite}">`
    Player.itemSelect.id = id
    Player.itemSelect.type = Items[Player.inv[id].id].type
    Player.itemSelect.name = Items[Player.inv[id].id].name
    inventory.openClose()
    inventory.openClose()
}


let opacity = 0.200

const tox = {
    dialogueBox: document.getElementById('dialogueBox'),
    interval: null,
    restore() {
        clearInterval(tox.interval)
        tox.dialogueBox.innerText = " "
        tox.dialogueBox.style.color = "#ffffff"
    },
    log(txt) {
        tox.restore()
        tox.dialogueBox.style.color = "rgb(244,234,0)"
        tox.dialogueBox.innerText = txt

        tox.interval = setInterval(() => {
            tox.restore()
        }, 5000)
    },
    dialogue(speek, txt) {
        tox.restore()
        tox.dialogueBox.style.color = "#eeeeee"
        tox.dialogueBox.innerText = `${speek}: ${txt}`

        tox.interval = setInterval(() => {
            tox.restore()
        }, 5000)
    },
    error(txt) {
        tox.restore()
        tox.dialogueBox.style.color = "red"
        tox.dialogueBox.innerText = txt

        tox.interval = setInterval(() => {
            tox.restore()
        }, 5000)
    }
}
let game = {
    calendary: JSON.parse(localStorage.getItem("Calendary")) || {
        minutos: 0,
        horas: 7,
        horasD: "am",
        dias: 1,
        dia: "lunes",
        año: 1,
        estacion: "Primavera"
    }
}
let diaAct = JSON.parse(localStorage.getItem("diaAct")) || 0
setInterval(() => {
    game.calendary.minutos++

    if (game.calendary.dias <= 24) game.calendary.estacion = "Primavera"
    else if (game.calendary.dias <= 48) game.calendary.estacion = "Verano"
    else if (game.calendary.dias <= 76) game.calendary.estacion = "Otoño"
    else if (game.calendary.dias <= 96) game.calendary.estacion = "Invierno"


    if (game.calendary.minutos >= 60) {
        game.calendary.minutos = 0
        game.calendary.horas++
    }
    let dias = [
        "Lunes",
        "Martes",
        "Miercoles",
        "Juebes",
        "Viernes",
        "Sabado",
        "Domingo"
    ]
    if(diaAct > 6) diaAct = 0
    game.calendary.dia = dias[diaAct]
    
    if (game.calendary.horas > 12 && game.calendary.horasD === "am") {
        game.calendary.horas = 1
        game.calendary.horasD = "pm"
    }
    if (game.calendary.horas > 12 && game.calendary.horasD === "pm") {
        game.calendary.horas = 1
        game.calendary.horasD = "am"
        game.calendary.dias++
        diaAct++
    }
    if (game.calendary.dias > 96) {
        game.calendary.dias = 1
        game.calendary.año++
    }
    if(game.calendary.horasD === "am" && game.calendary.horas >= 5) {
        if(opacity > 0) opacity-=0.002
    } else if (game.calendary.horas < 5 && game.calendary.horasD === "pm") {
        if(opacity > 0) opacity-=0.001
    } else if(game.calendary.horasD === "pm") {
        if(opacity < 1 ) opacity+=0.0015
    }
    
    if(game.calendary.horas === 10 && game.calendary.minutos === 0 && game.calendary.horasD === "pm") {
        tox.dialogue("Sistema", `Es tarde, deberias regresar a dormir.`)
    }
    if(game.calendary.horas === 1 && game.minutos === 15 && game.calendary.horasD === "am") {
        Commands.sleepForce()
    }
    if(game.calendary.horas === 7 && game.calendary.minutos === 0 && game.calendary.horasD === "am") {
        tox.dialogue("Sistema", `Amanecer dia ${game.calendary.dias} de ${game.calendary.estacion} del año ${game.calendary.año}`)
    }
}, 1000)

const teclas = {
    left: { isDown: false, onclick: false },
    right: { isDown: false, onclick: false },
    up: { isDown: false, onclick: false },
    down: { isDown: false, onclick: false },
    e: { isDown: false, onclick: false },
    q: { isDown: false, onclick: false },
    Tab: { isDown: false, onclick: false }
}

window.addEventListener('keydown', e => {
    document.getElementById('controls').style.display = "none"
    if(!inventory.isOpen) {
        if(e.key === 'ArrowLeft' || e.key === 'a') teclas.left.isDown = true
        if(e.key === 'ArrowRight' || e.key === 'd') teclas.right.isDown = true
        if(e.key === 'ArrowUp' || e.key === 'w') teclas.up.isDown = true
        if(e.key === 'ArrowDown' || e.key === 's') teclas.down.isDown = true
        if(e.key === 'e' && teclas.e.onclick === false) {
            teclas.e.isDown = true
            teclas.e.onclick = true
            interact()
        }
        if(e.key === 'q' && teclas.q.onclick === false) {
            teclas.q.isDown = true
            teclas.q.onclick = true
            atack()
        }
    }
    if(e.key === 'Tab' && !teclas.Tab.onclick) {
        teclas.Tab.isDown = true
        teclas.Tab.onclick = true
        if(inventory.isOpen === false) {
            inventory.open()
        }
        else {
            inventory.restore
        }
    }
})
window.addEventListener('keyup', e => {
    if(e.key === 'ArrowLeft' || e.key === 'a') teclas.left.isDown = false
    if(e.key === 'ArrowRight' || e.key === 'd') teclas.right.isDown = false
    if(e.key === 'ArrowUp' || e.key === 'w') teclas.up.isDown = false
    if(e.key === 'ArrowDown' || e.key === 's') teclas.down.isDown = false
    if(e.key === 'e') {
        teclas.e.onclick = false
    }
    if(e.key === 'q') {
        teclas.q.onclick = false
    }
})

function generateRandomNumber(digit) {
    let number = ""
    for (let i = 0; i < digit; i++) {
        number += `${Math.floor(Math.random() * 9)}`
    }
    if (number === undefined || number === null || number === "") number = Math.floor(Math.random() * 9)

    return number
}


Player.idPlayer = generateRandomNumber(18)

async function saveProgress() { 
    await localStorage.setItem("Player", JSON.stringify(Player));
    await localStorage.setItem("Calendary", JSON.stringify(game.calendary))
    await localStorage.setItem("diaAct", JSON.stringify(diaAct))

    if(!window.db) return
    try {
        await window.fb.setDoc(window.fb.doc(window.db, "users", Player.idPlayer), {
            pos: Player.pos,
            itemSelect: Player.itemSelect,
            dir: Player.dir
        })
    } catch(e) { console.error(e) }
}
setInterval(saveProgress, 500)

function dropItems(items, item) {
    tox.dialogue("Sistema", "Se te an caido " + items + " items al suelo")
    for(let i = 0; i < items; i++) {
        let x = 0
        let y = 0
        
        if(Player.dir === "left") x = Player.pos.x + 60
        if(Player.dir === "right") x = Player.pos.x - 60
        if(Player.dir === "up") y = Player.pos.y - 60
        if(Player.dir === "down") y = Player.pos.x + 60
        
        if(y === 0) y = Player.pos.y + Math.floor(Math.random() * 120) - 60
        if(x === 0) x = Player.pos.x + Math.floor(Math.random() * 120) - 60
        
        ItemsDrops.push({
            x: x,
            y: y,
            id: item.id
        })
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "rgb(0,209,13)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    let CamX = Player.pos.x - canvas.width / 2
    let CamY = Player.pos.y - canvas.height / 2
    
    World.forEach(w=> {
        const b = Blocks[w.id]
        ctx.save()
        ctx.scale(w.flipX ? -1 : 1, w.flipY ? -1 : 1)
        let pX = w.pos.x
        let pY = w.pos.y
        
        let dX = null
        
        if(w.flipX) dX = pX + CamX
        
        if(w.flipX) pX = -w.pos.x-b.tam.w
        if(w.flipY) pY = -w.pos.y-b.tam.h
        if(b.type === "puerta") {
            if(w.active === true) {
                ctx.drawImage(
                    b.sprite,
                    b.spriteDraw * b.spriteWidth,
                    0, 
                    b.spriteWidth, 
                    b.spriteHeight, 
                    pX - CamX,
                    pY - CamY,
                    b.tam.w,
                    b.tam.h
                );
            } else {
                    ctx.drawImage(
                        b.sprite,
                        w.sprite * b.spriteWidth,
                        0, 
                        b.spriteWidth, 
                        b.spriteHeight, 
                        pX - camX,
                        pY - CamY,
                        b.tam.w,
                        b.tam.h
                    );
            }
        } else if(b.type === "arbol") {
            let e = game.calendary.estacion
            let eDraw = 0
            if(e === "Primavera") eDraw = b.estacionSprites.Primavera
            if(e === "Verano") eDraw = b.estacionSprites.Verano
            if(e === "Otoño") eDraw = b.estacionSprites.Otoño
            if(e === "Invierno") eDraw = b.estacionSprites.Invierno
            
            ctx.drawImage(
                b.sprite,
                eDraw * b.spriteWidth,
                0, 
                b.spriteWidth, 
                b.spriteHeight, 
                pX - CamX,
                pY - CamY,
                b.tam.w,
                b.tam.h
            );
            
        } else {
            if(w.flipX) {
                ctx.drawImage(
                    b.sprite,
                    w.sprite * b.spriteWidth,
                    0, 
                    b.spriteWidth, 
                    b.spriteHeight, 
                    pX + CamX,
                    pY - CamY,
                    b.tam.w+1,
                    b.tam.h
                );
            } else {
                ctx.drawImage(
                    b.sprite,
                    w.sprite * b.spriteWidth,
                    0, 
                    b.spriteWidth, 
                    b.spriteHeight, 
                    pX - CamX,
                    pY - CamY,
                    b.tam.w+1,
                    b.tam.h
                );
            }
        }
        ctx.restore()
    })
    
    ctx.fillStyle = "#5706b1";
    for (let id in Jugadores) {
        let p = Jugadores[id];

        if (p && p.pos) {
            ctx.fillRect(p.pos.x - CamX, p.pos.y - CamY, Player.tam.w, Player.tam.h);
        }
    }   
    
    ctx.fillStyle = "red"
    for (let id in NPCs) {
        let p = NPCs[id];
        
        if(p.sex === "femenino") ctx.fillStyle = "#fe35ff"

        if (p && p.pos && p.positionMap === Player.positionMap) {
            p.draw()
        }
    }
    
    let ItemImage = new Image()
    ItemsDrops.forEach(item=>{
        ItemImage.src = Items[item.id].sprite
        ctx.drawImage(
            ItemImage,
            item.x - CamX,
            item.y - CamY,
            30,
            30
        )
    })

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(Player.pos.x - CamX, Player.pos.y - CamY, Player.tam.w, Player.tam.h)
    
    World.forEach(w=>{
        if(w.id === 1) {
                let pX = w.pos.x
                let pY = w.pos.y
                let b = Blocks[w.id]
                ctx.drawImage(
                    b.sprite,
                    w.sprite * b.spriteWidth + b.spriteWidth,
                    0, 
                    b.spriteWidth, 
                    b.spriteHeight, 
                    pX - CamX,
                    pY - CamY,
                    b.tam.w+1,
                    b.tam.h
                );
        }
    })
    
    ctx.fillStyle = `rgb(0,0,0, ${opacity})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function isColliding(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function checkCollision(x, y) {
    let playerRect = {
        x: x,
        y: y + Player.tam.h / 2,
        w: Player.tam.w,
        h: Player.tam.h / 2
    };

    for (let i = 0; i < World.length; i++) {
        let block = World[i];
        let blockType = Blocks[block.id];

        if (blockType.type !== 'solid') continue;

        let blockRect = {
            x: block.pos.x,
            y: block.pos.y,
            w: blockType.tam.w,
            h: blockType.tam.h
        };

        if (isColliding(playerRect, blockRect)) {
            if (blockType.type === 'puerta' && !block.active) {
                World[i].active = true
            }
            return true;
        }
    }

    return false;
}

let menuOpen = false
function menuOpenClose() {
    if(inventory.isOpen) return
    let m = document.getElementById("menu")
    
    if(menuOpen) {
        m.style.display = "none"
        menuOpen = false
    } else {
        m.style.display = "block"
        menuOpen = true
    }
}
function update() {
    let calendaryDisplay = document.getElementById("calendary")
    let horaryDisplay = document.getElementById("horary")
    calendaryDisplay.innerText = `Dia ${game.calendary.dias} de ${game.calendary.estacion}`
    horaryDisplay.innerText = `${game.calendary.horas}:${game.calendary.minutos}${game.calendary.horasD}`
    
    let speed = Player.speed;
    this.keys = teclas;
    
    let newX = Player.pos.x;
    if (this.keys.left.isDown) newX -= speed;
    if (this.keys.right.isDown) newX += speed;

    if (!checkCollision(newX, Player.pos.y)) {
        Player.pos.x = newX;
    }

    let newY = Player.pos.y;
    if (this.keys.up.isDown) newY -= speed;
    if (this.keys.down.isDown) newY += speed;

    if (!checkCollision(Player.pos.x, newY)) {
        Player.pos.y = newY;
    }

    draw();
    requestAnimationFrame(update.bind(this));
}

window.onload = () => {
    update();
}
let left = document.getElementById('left')
let right = document.getElementById('right')
let down = document.getElementById('down')
let up = document.getElementById('up')

inventory.open()

inventory.restore()

function loadWorld() {
    let data = JSON.parse(localStorage.getItem("Player"))
    let wld = data.positionMap
    if(wld === "lobby") changueWorld(MapGeneral.lobby, wld)
    if(wld === "pueblo") changueWorld(MapGeneral.pueblo, wld)
    if(wld === "prision") changueWorld(MapGeneral.prision, wld)
}
loadWorld()
changueWorld(MapGeneral.pueblo, "pueblo")
Commands.sleep()