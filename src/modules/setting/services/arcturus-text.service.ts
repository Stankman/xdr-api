import { Injectable } from "@nestjs/common";
import { ArcturusTextsRepository } from "../repositories/arcturus-texts.repository";

@Injectable()
export class ArcturusTextService {
    constructor(
        private readonly repository : ArcturusTextsRepository
    ) {}
}