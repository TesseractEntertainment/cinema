import { Broadcast } from "./Broadcast";
import { User } from "./User";

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

export class UserDTO {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    static fromUser(user: User): UserDTO {
        return new UserDTO(user.id, user.name);
    }

    static fromUsers(users: User[]): UserDTO[] {
        return users.map((user) => UserDTO.fromUser(user));
    }

    static fromUserMap(users: Map<string, User>): UserDTO[] {
        return UserDTO.fromUsers(Array.from(users.values()));
    }
}