/** Staff invite ports — Postman Staff Invites folder (tip 7ae38910). */

export type StaffInviteTargetRole = "TRAINER" | "ADMIN";

export type StaffInviteStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REVOKED"
  | "EXPIRED";

/** Embedded on inbox items (Postman Staff Invite Inbox). */
export type StaffInviteGym = {
  id: string;
  name: string;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  timezone: string;
};

export type StaffInvite = {
  id: string;
  gymOrgId: string;
  /** Present on inbox responses; omitted on gym-scoped list/create. */
  gym?: StaffInviteGym;
  invitedUserId: string;
  targetRole: StaffInviteTargetRole;
  status: StaffInviteStatus;
  expiresAt: string;
  createdBy: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffInvitePage = {
  items: StaffInvite[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateStaffInviteInput = {
  staffCode: string;
  targetRole: StaffInviteTargetRole;
  expiresAt?: string;
};

export type StaffInvitesReader = {
  listForGym: (input: {
    accessToken: string;
    gymOrgId: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ staffInvites: StaffInvitePage }>;

  listInbox: (input: {
    accessToken: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ staffInvites: StaffInvitePage }>;
};

export type StaffInvitesWriter = {
  create: (input: {
    accessToken: string;
    gymOrgId: string;
    body: CreateStaffInviteInput;
  }) => Promise<{ staffInvite: StaffInvite }>;

  revoke: (input: {
    accessToken: string;
    inviteId: string;
  }) => Promise<{ staffInvite: StaffInvite }>;

  accept: (input: {
    accessToken: string;
    inviteId: string;
  }) => Promise<{ staffInvite: StaffInvite }>;
};
