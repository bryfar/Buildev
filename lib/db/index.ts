import Dexie, { Table } from 'dexie';
import { Project, SiteElement } from '../types';

export class ProjectDatabase extends Dexie {
    projects!: Table<Project, string>;

    constructor() {
        super('BuildevDB');
        this.version(1).stores({
            projects: 'id, name, createdAt, updatedAt' // Primary key and indexed props
        });
    }
}

export const db = new ProjectDatabase();

// Helper functions
export async function saveProject(project: Project) {
    return await db.projects.put(project);
}

export async function getProjects() {
    return await db.projects.toArray();
}

export async function getProject(id: string) {
    return await db.projects.get(id);
}

export async function deleteProject(id: string) {
    return await db.projects.delete(id);
}
