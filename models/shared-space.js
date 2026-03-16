const MEMBERSHIP_ROLES = {
  OWNER: 'owner',
  PARTNER: 'partner',
};

function createSharedSpace(input) {
  return {
    id: input.id,
    ownerUserId: input.ownerUserId,
    name: input.name || '我们的空间',
    inviteCode: input.inviteCode || null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

function createMembership(input) {
  return {
    id: input.id,
    sharedSpaceId: input.sharedSpaceId,
    userId: input.userId,
    role: input.role || MEMBERSHIP_ROLES.PARTNER,
    joinedAt: input.joinedAt,
  };
}

module.exports = {
  MEMBERSHIP_ROLES,
  createSharedSpace,
  createMembership,
};
