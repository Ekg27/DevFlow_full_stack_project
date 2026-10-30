import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import MemberList from '../components/team/MemberList';
import AddMemberModal from '../components/team/AddMemberModal';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import ProjectModal from '../components/projects/ProjectModal';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { memberService } from '../services/memberService';
import { activityService } from '../services/activityService';
import {
  KanbanIcon,
  ListTodoIcon,
  UsersIcon,
  ActivityIcon,
  LayoutDashboardIcon,
  PlusIcon,
  CalendarIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
} from '../components/common/Icons';
import { formatDate, isOverdue } from '../utils/helpers';

export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab state: 'overview' | 'board' | 'tasks' | 'team' | 'activity'
  const [activeTab, setActiveTab] = useState('board');

  // Core project data states
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [initialTaskStatus, setInitialTaskStatus] = useState('To Do');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tasks list view filter states
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // 1. Fetch project, tasks, members, and activity
  const loadWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, membersRes, actRes] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getProjectTasks(projectId),
        memberService.getMembers(projectId),
        activityService.getProjectActivity(projectId),
      ]);

      if (projRes.success) setProject(projRes.project);
      if (tasksRes.success) setTasks(tasksRes.tasks || []);
      if (membersRes.success) setMembers(membersRes.members || []);
      if (actRes.success) setActivities(actRes.activities || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load project workspace';
      showToast(msg, 'error');
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast, navigate]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Handle URL query parameter `?taskId=...` to automatically open task detail modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskIdParam = params.get('taskId');
    if (taskIdParam && tasks.length > 0) {
      const found = tasks.find((t) => t.id === Number(taskIdParam));
      if (found) {
        setSelectedTask(found);
      }
    }
  }, [location.search, tasks]);

  // 2. Task status change (Kanban drag-and-drop or status selector)
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const data = await taskService.updateTask(taskId, { status: newStatus });
      if (data.success && data.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? data.task : t))
        );
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(data.task);
        }
        // Refresh project completion percentage
        projectService.getProject(projectId).then((p) => {
          if (p.success) setProject(p.project);
        });
      }
    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      showToast(err.response?.data?.message || 'Failed to update task status', 'error');
    }
  };

  // 3. Create or Edit Task submit handler
  const handleTaskSubmit = async (taskFormData) => {
    try {
      setIsSubmitting(true);
      if (editingTask) {
        // Edit task
        const data = await taskService.updateTask(editingTask.id, taskFormData);
        if (data.success && data.task) {
          setTasks((prev) =>
            prev.map((t) => (t.id === editingTask.id ? data.task : t))
          );
          if (selectedTask && selectedTask.id === editingTask.id) {
            setSelectedTask(data.task);
          }
          showToast('Task updated successfully', 'success');
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }
      } else {
        // Create task
        const data = await taskService.createTask(projectId, taskFormData);
        if (data.success && data.task) {
          setTasks((prev) => [data.task, ...prev]);
          showToast('Task created successfully', 'success');
          setIsTaskModalOpen(false);
        }
      }
      // Reload activities & project progress
      activityService.getProjectActivity(projectId).then((res) => {
        if (res.success) setActivities(res.activities || []);
      });
      projectService.getProject(projectId).then((res) => {
        if (res.success) setProject(res.project);
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete Task handler
  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;

    try {
      const data = await taskService.deleteTask(task.id);
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        if (selectedTask && selectedTask.id === task.id) {
          setSelectedTask(null);
        }
        showToast('Task deleted successfully', 'success');
        // Refresh project stats
        projectService.getProject(projectId).then((p) => {
          if (p.success) setProject(p.project);
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  // 5. Add team member handler
  const handleAddMember = async (memberData) => {
    try {
      setIsSubmitting(true);
      const data = await memberService.addMember(projectId, memberData);
      if (data.success && data.member) {
        setMembers((prev) => [...prev, data.member]);
        showToast('Member added to project', 'success');
        setIsAddMemberOpen(false);
        // Refresh project
        projectService.getProject(projectId).then((p) => {
          if (p.success) setProject(p.project);
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Remove team member handler
  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} from this project?`)) return;

    try {
      const data = await memberService.removeMember(projectId, member.user_id);
      if (data.success) {
        setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
        showToast(`Member ${member.name} removed`, 'success');
        // Reload tasks (any tasks assigned to removed member become unassigned)
        taskService.getProjectTasks(projectId).then((t) => {
          if (t.success) setTasks(t.tasks || []);
        });
        projectService.getProject(projectId).then((p) => {
          if (p.success) setProject(p.project);
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  // 7. Update project details handler
  const handleUpdateProject = async (formData) => {
    try {
      setIsSubmitting(true);
      const data = await projectService.updateProject(projectId, formData);
      if (data.success && data.project) {
        setProject((prev) => ({ ...prev, ...data.project }));
        showToast('Project updated successfully', 'success');
        setIsEditProjectOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Project Workspace">
        <Loader size="lg" message="Loading project workspace..." />
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout title="Project Not Found">
        <EmptyState
          title="Project not found"
          description="The requested project does not exist or you do not have permission to view it."
          actionLabel="Back to Projects"
          onAction={() => navigate('/projects')}
        />
      </AppLayout>
    );
  }

  const currentUserRole = project.user_role || 'Member';
  const isOwner = currentUserRole === 'Owner';
  const isAdmin = currentUserRole === 'Admin' || isOwner;

  // Filter tasks for the 'Tasks' list tab
  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(taskSearch.toLowerCase()));
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    const matchPriority = priorityFilter ? t.priority === priorityFilter : true;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <AppLayout
      title={project.name}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              icon={<EditIcon size={14} />}
              onClick={() => setIsEditProjectOpen(true)}
            >
              Edit Project
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon size={14} />}
            onClick={() => {
              setEditingTask(null);
              setInitialTaskStatus('To Do');
              setIsTaskModalOpen(true);
            }}
          >
            New Task
          </Button>
        </div>
      }
    >
      {/* Project Workspace Header */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', letterSpacing: -0.4 }}>
                {project.name}
              </h1>
              <Badge type="role" value={currentUserRole} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 640, lineHeight: 1.5 }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: 'var(--text-dim)' }}>
            {project.deadline && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarIcon size={16} />
                <span>
                  Deadline: <strong style={{ color: 'var(--text-main)' }}>{formatDate(project.deadline)}</strong>
                </span>
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UsersIcon size={16} />
              <span>
                Members: <strong style={{ color: 'var(--text-main)' }}>{members.length}</strong>
              </span>
            </span>
          </div>
        </div>

        {/* Workspace Progress Indicator */}
        <div style={{ marginTop: 18 }}>
          <ProgressBar percentage={project.progress_percentage || 0} showLabel />
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="tabs-nav" aria-label="Project workspace sections">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboardIcon size={15} />
          <span>Overview</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
          onClick={() => setActiveTab('board')}
        >
          <KanbanIcon size={15} />
          <span>Board ({tasks.length})</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <ListTodoIcon size={15} />
          <span>Tasks List</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <UsersIcon size={15} />
          <span>Team ({members.length})</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <ActivityIcon size={15} />
          <span>Activity</span>
        </button>
      </nav>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Metrics */}
          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <span className="stat-header">Total Tasks</span>
              <span className="stat-value">{tasks.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-header">To Do</span>
              <span className="stat-value" style={{ color: 'var(--text-dim)' }}>
                {tasks.filter((t) => t.status === 'To Do').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-header">In Progress</span>
              <span className="stat-value" style={{ color: 'var(--brand-primary)' }}>
                {tasks.filter((t) => t.status === 'In Progress').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-header">Done</span>
              <span className="stat-value" style={{ color: 'var(--color-success)' }}>
                {tasks.filter((t) => t.status === 'Done').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-header">Overdue</span>
              <span className="stat-value" style={{ color: 'var(--color-danger)' }}>
                {tasks.filter((t) => isOverdue(t.due_date, t.status)).length}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            {/* Team Preview */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>Team Members</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('team')}>
                  Manage Team
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.slice(0, 5).map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                          {m.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{m.email}</span>
                      </div>
                    </div>
                    <Badge type="role" value={m.role} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Snapshot */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>Recent Project Activity</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('activity')}>
                  Full Log
                </Button>
              </div>
              <ActivityTimeline activities={activities.slice(0, 5)} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: KANBAN BOARD */}
      {activeTab === 'board' && (
        <div>
          <KanbanBoard
            tasks={tasks}
            onOpenTask={(task) => setSelectedTask(task)}
            onStatusChange={handleStatusChange}
            onAddTask={(status) => {
              setEditingTask(null);
              setInitialTaskStatus(status);
              setIsTaskModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Tab 3: TASKS LIST */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              backgroundColor: 'var(--bg-card)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                <SearchIcon size={14} />
              </span>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 30, fontSize: 12 }}
                placeholder="Filter tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: 12 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            {/* Priority Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: 12 }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <th style={{ padding: '12px 18px' }}>Task</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                  <th style={{ padding: '12px 18px' }}>Priority</th>
                  <th style={{ padding: '12px 18px' }}>Assignee</th>
                  <th style={{ padding: '12px 18px' }}>Due Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                      No tasks found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const overdue = isOverdue(t.due_date, t.status);
                    return (
                      <tr
                        key={t.id}
                        style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        onClick={() => setSelectedTask(t)}
                      >
                        <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {t.title}
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <Badge type="status" value={t.status} />
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <Badge type="priority" value={t.priority} />
                        </td>
                        <td style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>
                          {t.assignee_name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Avatar name={t.assignee_name} size="sm" />
                              <span>{t.assignee_name}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 18px', color: overdue ? 'var(--color-danger)' : 'var(--text-dim)', fontSize: 12 }}>
                          {t.due_date ? formatDate(t.due_date) : '-'}
                        </td>
                        <td style={{ padding: '12px 18px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTask(t);
                                setIsTaskModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteTask(t)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: TEAM */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                icon={<PlusIcon size={14} />}
                onClick={() => setIsAddMemberOpen(true)}
              >
                Add Member
              </Button>
            </div>
          )}
          <MemberList
            members={members}
            currentUserRole={currentUserRole}
            currentUserId={user?.id}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      )}

      {/* Tab 5: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 20 }}>
            Project Activity Audit Log ({activities.length})
          </h3>
          <ActivityTimeline activities={activities} />
        </div>
      )}

      {/* Modal: Create / Edit Task */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        initialStatus={initialTaskStatus}
        members={members}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Task Details & Comments */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onEdit={(task) => {
          setSelectedTask(null);
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        onCommentCountChange={(taskId, newCount) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, comment_count: newCount } : t))
          );
        }}
      />

      {/* Modal: Add Team Member */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Edit Project */}
      <ProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleUpdateProject}
        initialData={project}
        isSubmitting={isSubmitting}
      />
    </AppLayout>
  );
}
