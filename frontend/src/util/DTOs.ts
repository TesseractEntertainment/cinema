import { Broadcast } from "./broadcast";
import { PeerConnectionState } from "./connection";
import { User } from "./user";

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
        return new BroadcastDTO(broadcast.id, broadcast.name, broadcast.broadcasterIds, broadcast.listenerIds);
    }

    static fromBroadcasts(broadcasts: Broadcast[]): BroadcastDTO[] {
        return broadcasts.map((broadcast) => BroadcastDTO.fromBroadcast(broadcast));
    }

    static fromBroadcastMap(broadcasts: Map<string, Broadcast>): BroadcastDTO[] {
        return BroadcastDTO.fromBroadcasts(Array.from(broadcasts.values()));
    }

    static toBroadcast(broadcastDTO: BroadcastDTO): Broadcast {
        const broadcast: Broadcast = {id: broadcastDTO.id, name: broadcastDTO.name, broadcasterIds: broadcastDTO.broadcasterIds, listenerIds: broadcastDTO.listenerIds};
        return broadcast;
    }

    static toBroadcasts(broadcastDTOs: BroadcastDTO[]): Broadcast[] {
        return broadcastDTOs.map((broadcastDTO) => this.toBroadcast(broadcastDTO));
    }

    static toBroadcastMap(broadcastDTOs: BroadcastDTO[]): Map<string, Broadcast> {
        const broadcastMap: Map<string, Broadcast> = new Map();
        broadcastDTOs.forEach((broadcastDTO) => {
            broadcastMap.set(broadcastDTO.id, this.toBroadcast(broadcastDTO));
        });
        return broadcastMap;
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

    static toUser(userDTO: UserDTO): User {
        const user: User = {id: userDTO.id, name: userDTO.name, connectionState: PeerConnectionState.DISCONNECTED};
        return user;
    }

    static toUsers(userDTOs: UserDTO[]): User[] {
        return userDTOs.map((userDTO) => this.toUser(userDTO));
    }

    static toUserMap(userDTOs: UserDTO[]): Map<string, User> {
        const userMap: Map<string, User> = new Map();
        userDTOs.forEach((userDTO) => {
            userMap.set(userDTO.id, this.toUser(userDTO));
        });
        return userMap;
    }

}