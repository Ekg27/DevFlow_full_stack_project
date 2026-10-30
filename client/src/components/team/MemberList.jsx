import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { TrashIcon, ShieldIcon } from '../common/Icons';
import { formatDate } from '../../utils/helpers';

export default function MemberList({
  members = [],
  currentUserRole = 'Member',
  currentUserId,
  onRemoveMember,
}) {
  const isOwner = currentUserRole === 'Owner';
  const isAdmin = currentUserRole === 'Admin' || isOwner;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>
          Project Members ({members.length})
        </h3>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Your role: <strong style={{ color: 'var(--brand-primary)' }}>{currentUserRole}</strong>
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <th style={{ padding: '12px 20px' }}>Member</th>
              <th style={{ padding: '12px 20px' }}>Email</th>
              <th style={{ padding: '12px 20px' }}>Role</th>
              <th style={{ padding: '12px 20px' }}>Joined Date</th>
              {isAdmin && <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isSelf = member.user_id === currentUserId;
              const isTargetOwner = member.role === 'Owner';
              const isTargetAdmin = member.role === 'Admin';

              // Removal permission check:
              // Cannot remove Owner.
              // Admin cannot remove other Admins (only Owner can).
              // Can remove Member.
              const canRemove =
                isAdmin &&
                !isTargetOwner &&
                (!isTargetAdmin || isOwner);

              return (
                <tr
                  key={member.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  {/* Name + Avatar */}
                  <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={member.name} size="sm" />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                        {member.name} {isSelf && <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(You)</span>}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                    {member.email}
                  </td>

                  {/* Role */}
                  <td style={{ padding: '14px 20px' }}>
                    <Badge type="role" value={member.role} />
                  </td>

                  {/* Joined Date */}
                  <td style={{ padding: '14px 20px', color: 'var(--text-dim)', fontSize: 12 }}>
                    {formatDate(member.joined_at)}
                  </td>

                  {/* Action */}
                  {isAdmin && (
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {canRemove ? (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<TrashIcon size={13} />}
                          onClick={() => onRemoveMember(member)}
                        >
                          Remove
                        </Button>
                      ) : isTargetOwner ? (
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                          Owner
                        </span>
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
