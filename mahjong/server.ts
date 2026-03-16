import { serveDir } from "https://deno.land/std@0.217.0/http/file_server.ts";

const sockets: WebSocket[] = [];
let bricks: string = []
let counter = 0;
let bricksplaceholder = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "DV", "DR", "DG", "VE", "VS", "VW", "VN",]
for (let index = 0; index < 4; index++) {
    bricks.push(...bricksplaceholder)

}
for (let i = bricks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i + 1);
    [bricks[i], bricks[j]] = [bricks[j], bricks[i]];
}
console.log(bricks, bricks.length)


Deno.serve((request) => {
    if (request.headers.get("upgrade") == "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(request);

        let id: number;

        socket.onopen = () => {
            console.log("open");

            sockets.push(socket);
            id = counter++;

            if (counter == 4) {
                sockets[0].send("E");
                sockets[1].send("S");
                sockets[2].send("W");
                sockets[3].send("N");
                sockets[0].send(JSON.stringify(bricks.splice(0, 14)))
                sockets[1].send(JSON.stringify(bricks.splice(0, 13)))
                sockets[2].send(JSON.stringify(bricks.splice(0, 13)))
                sockets[3].send(JSON.stringify(bricks.splice(0, 13)))

            }
        };

        socket.onmessage = (event) => {
            console.log("  message: " + event.data);

            console.log(1 - id)

            if (event.data == "dra") {
                sockets[id].send(bricks.splice(0, 1)[0])
                for (let index = 0; index < 4; index++) {
                    if(index != id){
                        sockets[index].send("drog")
                    }
                    
                }
            } else if (event.data.endsWith("pong")) {
                console.log(event.data)
                sockets[0].send(event.data)
                sockets[1].send(event.data)
                sockets[2].send(event.data)
                sockets[3].send(event.data)

            } else if (event.data.endsWith("kong")) {
                console.log(event.data)
                for (let index = 0; index < 4; index++) {
                    if(index != id){
                        sockets[index].send(event.data)
                    } else {
                        sockets[index].send(bricks.splice(0, 1) + event.data)
                    }
                    
                }
            } else {
                sockets[0].send(event.data)
                sockets[1].send(event.data)
                sockets[2].send(event.data)
                sockets[3].send(event.data)
            }

        };

        socket.onclose = () => console.log("close");

        socket.onerror = () => console.log("error");

        return response;
    }

    return serveDir(request, {
        fsRoot: "public",
    });
});
