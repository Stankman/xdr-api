import { Injectable } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { RconDTO } from "../dtos/rcon.dto";
import { Socket } from "net";
import { RconException } from "../exceptions/rcon.exception";

@Injectable()
export class RconService {
    constructor(
        private readonly socketService : SocketService
    ) {}

    public async executeCommand(rconDTO : RconDTO, avatarId: number) : Promise<any> {
        let rconResponse : any = null;
        
        try {
            const socket : Socket = await this.socketService.connectToSocket();
            
            if(rconDTO.params['user_id']) {
                rconDTO.params['user_id'] = rconDTO.params['user_id'].replace('%userId%', avatarId);
            }
            
            rconResponse = await this.socketService.sendCommand(socket, rconDTO.command, rconDTO.params ?? null);
        } catch(error) {
            console.error(error);
            throw new RconException();
        }

        return rconResponse;
    }

    public executeData(data: string, avatarId: number) : void {
        let commands : RconDTO[] = JSON.parse(data);

        commands.forEach(command => {
            this.executeCommand(command, avatarId);
        });
    }
}