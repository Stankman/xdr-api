import { CustomResponse } from "../models/custom-response.model";
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseHelper {
    public generateResponse(data : any) : CustomResponse {
        let customResponse = new CustomResponse();

        customResponse.data = data;

        return customResponse;
    }
}