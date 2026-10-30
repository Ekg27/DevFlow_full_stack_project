import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { projectService } from '../services/projectService';
import { PlusIcon, SearchIcon } from '../components/common/Icons';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSubmitProject = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingProject) {
        // Update existing project
        const data = await projectService.updateProject(editingProject.id, formData);
        if (data.success) {
          showToast('Project updated successfully', 'success');
          setIsModalOpen(false);
          loadProjects();
        }
      } else {
        // Create new project
        const data = await projectService.createProject(formData);
        if (data.success) {
          showToast('Project created successfully', 'success');
          setIsModalOpen(false);
          loadProjects();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${project.name}"? This will permanently delete all tasks, members, and activity logs.`
      )
    ) {
      return;
    }

    try {
      const data = await projectService.deleteProject(project.id);
      if (data.success) {
        showToast(`Project "${project.name}" deleted`, 'success');
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout
      title="Projects"
      actions={
        <Button variant="primary" icon={<PlusIcon size={14} />} onClick={handleOpenCreate}>
          New Project
        </Button>
      }
    >
      {/* Top Header & Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Workspaces you belong to. Click any project to open its Kanban board and task tracking.
          </p>
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
            <SearchIcon size={14} />
          </span>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <Loader size="lg" message="Loading your projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="You are not a member of any projects yet. Create your first project workspace to get started!"
          actionLabel="Create Project"
          onAction={handleOpenCreate}
        />
      ) : filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
          No projects matching &quot;{search}&quot;
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProject}
        initialData={editingProject}
        isSubmitting={isSubmitting}
      />
    </AppLayout>
  );
}
