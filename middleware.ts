import { verifyToken } from "./utils/firebaseAdmin";
import serverconfig from "./server.config.js";
import { NextFunction, Request, Response } from "express";

//check if the path needs auth, to add unrestricted paths check server.config
const pathWihoutAuth = (request: Request) => {
    let requestType = request.headers["sec-fetch-dest"];
    //ensure request is asking for html page and not static content, security flaw here but it works

    if (requestType && requestType === "document") {
        //check if the requested path is one in server config that allows a connection without auth
        if (serverconfig.unauthorizedURlPaths.some((authorizedPath) => request.path === authorizedPath)) {
            return true;
        } else {
            return false;
        }
    }
    return true;
};

export const authMiddleWare = async (request: Request, response: Response, next: NextFunction) => {
    if (pathWihoutAuth(request)) {
        next();
    } else {
        const fail = () => {
            response.redirect("/");
        };

        let token = request.headers.cookie?.split("=")[1];

        if (token) {
            verifyToken(token)
                .then(() => next())
                .catch((error) => {
                    console.log(error);
                    fail();
                });
        } else {
            fail();
        }
    }
};