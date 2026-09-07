const http = require("node:http");
const next = require("next");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const dev = process.env.NODE_ENV !== "production";
const portFlag = process.argv.indexOf("-p");
const port = Number(process.env.PORT || (portFlag >= 0 && process.argv[portFlag + 1]) || 3000);
const hostname = process.env.HOST || "0.0.0.0";

function readCookie(header, name) {
    const entry = (header || "").split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
    return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

async function start() {
    const app = next({ dev, hostname, port });
    await app.prepare();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is required");

    const server = http.createServer((request, response) => app.getRequestHandler()(request, response));
    const io = new Server(server, { path: "/socket.io" });

    io.use((socket, nextMiddleware) => {
        const token = readCookie(socket.handshake.headers.cookie, "token");
        if (!token) return nextMiddleware(new Error("Unauthorized"));

        try {
            socket.data.user = jwt.verify(token, secret);
            nextMiddleware();
        } catch {
            nextMiddleware(new Error("Unauthorized"));
        }
    });

    io.on("connection", socket => {
        const userId = socket.data.user.id;
        socket.join(`user:${userId}`);

        socket.on("subscribe:business", businessId => {
            if (typeof businessId === "string" && /^[a-f\d]{24}$/i.test(businessId)) {
                socket.join(`business:${businessId}`);
            }
        });

        socket.on("unsubscribe:business", businessId => {
            if (typeof businessId === "string") socket.leave(`business:${businessId}`);
        });
    });

    global.__LIVEQ_IO__ = io;
    server.listen(port, hostname, () => {
        console.log(`> LiveQ server ready on http://localhost:${port}`);
    });
}

start().catch(error => {
    console.error(error);
    process.exit(1);
});
