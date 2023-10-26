import { Broadcast } from "./Broadcast";

export class BroadcastDTO {
    id: string;
    name: string;
    broadcasterIds: string[];
    listenerIds: string[];

    constructor(id: string, name: string, broadcasterIds: string[], listenerIds: string[]) {
        this.id = id;
        this.name = name;
        this.broadcasterIds = broadcasterIds;
        this.listenerIds = listenerIds;
    }

    static fromBroadcast(broadcast: Broadcast): BroadcastDTO {
        return new BroadcastDTO(broadcast.id, broadcast.name, broadcast.broadcasters, broadcast.listeners);
    }

    static fromBroadcasts(broadcasts: Broadcast[]): BroadcastDTO[] {
        return broadcasts.map((broadcast) => BroadcastDTO.fromBroadcast(broadcast));
    }

    static fromBroadcastMap(broadcasts: Map<string, Broadcast>): BroadcastDTO[] {
        return BroadcastDTO.fromBroadcasts(Array.from(broadcasts.values()));
    }
}