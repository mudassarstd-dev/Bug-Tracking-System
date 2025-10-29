import { AvatarUser } from "./AvatarUser"

export interface BugDetails {
    id: string,
    details: string
    status: string
    dueDate: string
    assignees: AvatarUser[],
    canDelete: boolean,
    canUpdate: boolean
}

export interface BugDetailsForUpdate {
    id: string,
    details: string
    status: string
    dueDate: string
    assignees: AvatarUser[],
    screenshortUrl?: string
}

