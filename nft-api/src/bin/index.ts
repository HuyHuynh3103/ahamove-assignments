import http from 'http';
import { COLORS } from "../common/color";
import { ENV } from "../common/env";
import listEndpoints from 'express-list-endpoints';
import app from "../app";
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
    if (error.syscall !== "listen") {
        throw error;
    }
    const port = normalizePort(ENV.PORT || "3300");
    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Get port from environment and store in Express
 */

const port = normalizePort(ENV.PORT || "3300");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
    console.log(
        `${COLORS.FgBlack}${COLORS.BgYellow}%s${COLORS.Reset}`,
        `Server is running on port ${port}`
    );
    listEndpoints(app).forEach(
        (endpoint: { path: string; methods: string[] }) => {
            const method = endpoint.methods[0]?.toUpperCase();
            const { path } = endpoint;
            console.log(
                `${COLORS.FgCyan}%s${COLORS.Reset}`,
                `${method} -> ${path}`
            );
        }
    );
});
server.on("error", onError);