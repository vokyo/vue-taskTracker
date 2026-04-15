import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/api/projects', () => ({
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  getAllProjects: vi.fn(),
  updateProject: vi.fn(),
}));

import { useProjectStore } from '@/stores/projectStore';
import {
  createProject as createProjectApi,
  deleteProject as deleteProjectApi,
  getAllProjects as getAllProjectsApi,
} from '@/api/projects';

describe('projectStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchProjects populates state', async () => {
    const store = useProjectStore();
    const projects = [
      { id: 'proj-1', name: 'Alpha' },
      { id: 'proj-2', name: 'Beta' },
    ];

    getAllProjectsApi.mockResolvedValue(projects);

    await store.fetchProjects();

    expect(getAllProjectsApi).toHaveBeenCalled();
    expect(store.projects).toEqual(projects);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('addProject appends to state', async () => {
    const store = useProjectStore();
    const createdProject = { id: 'proj-1', name: 'Alpha' };

    createProjectApi.mockResolvedValue(createdProject);

    await store.addProject(createdProject);

    expect(createProjectApi).toHaveBeenCalledWith(createdProject);
    expect(store.projects).toEqual([createdProject]);
  });

  it('deleteProject removes the correct project', async () => {
    const store = useProjectStore();
    store.projects = [
      { id: 'proj-1', name: 'Alpha' },
      { id: 'proj-2', name: 'Beta' },
    ];

    deleteProjectApi.mockResolvedValue({});

    await store.deleteProject('proj-1');

    expect(deleteProjectApi).toHaveBeenCalledWith('proj-1');
    expect(store.projects).toEqual([{ id: 'proj-2', name: 'Beta' }]);
  });

  it('getProjectById getter returns the correct project', () => {
    const store = useProjectStore();
    store.projects = [
      { id: 'proj-1', name: 'Alpha' },
      { id: 'proj-2', name: 'Beta' },
    ];

    expect(store.getProjectById('proj-2')).toEqual({ id: 'proj-2', name: 'Beta' });
  });
});
