import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCurrentOrg } from '../hooks/useCurrentOrg';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useInvitations } from '../hooks/useInvitations';
import { TeamMembersList } from '../components/team/TeamMembersList';
import { PendingInvitations } from '../components/team/PendingInvitations';
import { InviteMemberModal } from '../components/team/InviteMemberModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function TeamPage() {
  const { user } = useAuth();
  const { orgId, isAdmin, loading: orgLoading } = useCurrentOrg();
  const { members, loading: membersLoading, refetch: refetchMembers } = useTeamMembers(orgId);
  const { invitations, loading: invitationsLoading, refetch: refetchInvitations } = useInvitations(orgId);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const loading = orgLoading || membersLoading || invitationsLoading;

  const refetchAll = () => {
    refetchMembers();
    refetchInvitations();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">צוות</h1>
        {isAdmin && <Button onClick={() => setShowInviteModal(true)}>+ הזמנת חבר צוות</Button>}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {user && (
            <TeamMembersList
              members={members}
              currentUserId={user.id}
              canManage={isAdmin}
              onChanged={refetchAll}
            />
          )}
          <PendingInvitations invitations={invitations} canManage={isAdmin} onChanged={refetchInvitations} />
        </>
      )}

      {showInviteModal && (
        <InviteMemberModal onClose={() => setShowInviteModal(false)} onInvited={refetchAll} />
      )}
    </div>
  );
}
