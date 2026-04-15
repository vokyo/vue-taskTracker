import { defineStore } from 'pinia';
import {
  createProject as createProjectApi,
  deleteProject as deleteProjectApi,
  getAllProjects,
  updateProject as updateProjectApi,
} from '@/api/projects';

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getProjectById: (state) => (id) =>
      state.projects.find((project) => String(project.id) === String(id)),
  },

  actions: {
    async fetchProjects() {
      this.isLoading = true;
      this.error = null;

      try {
        const projects = await getAllProjects();
        this.projects = projects;
        return projects;
      } catch (error) {
        this.error = error.message || 'Failed to fetch projects';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addProject(project) {
      this.isLoading = true;
      this.error = null;

      try {
        const createdProject = await createProjectApi(project);
        this.projects.push(createdProject);
        return createdProject;
      } catch (error) {
        this.error = error.message || 'Failed to add project';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateProject(id, data) {
      this.isLoading = true;
      this.error = null;

      try {
        const updatedProject = await updateProjectApi(id, data);
        const projectIndex = this.projects.findIndex((project) => project.id === id);

        if (projectIndex !== -1) {
          this.projects.splice(projectIndex, 1, updatedProject);
        } else {
          this.projects.push(updatedProject);
        }

        return updatedProject;
      } catch (error) {
        this.error = error.message || 'Failed to update project';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteProject(id) {
      this.isLoading = true;
      this.error = null;

      try {
        await deleteProjectApi(id);
        this.projects = this.projects.filter((project) => project.id !== id);
      } catch (error) {
        this.error = error.message || 'Failed to delete project';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
