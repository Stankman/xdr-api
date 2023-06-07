import { Injectable } from "@nestjs/common";
import { Socket } from "net";
import { RconException } from "../exceptions/rcon.exception";
import { RconConfigService } from "src/config/rcon/rcon-config.service";

@Injectable()
export class SocketService {
    constructor(
        private readonly rconConfig : RconConfigService
    ) {}

    public async connectToSocket() : Promise<Socket> {
        const socket : Socket = new Socket();

        try {
            socket.connect({
                host: this.rconConfig.host,
                port: this.rconConfig.port,
                family: 4
            });
        } catch (error) {
            throw new RconException();
        }

        return socket;
    }

    public async sendCommand(socket : Socket, command : string, parameters : any = null) : Promise<any> {
        const encodedData : string = JSON.stringify({
            key: command,
            data: parameters
        });

        const executor : boolean = socket.write(encodedData);

        if(!executor) {
            throw new RconException();
        }

        return JSON.parse(socket.read(2048));
    }
}