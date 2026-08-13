/** Membership invites — Postman Membership Invites folder (Admin gym-scoped). */

export type MembershipInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export type MembershipPaymentStatus = "paid" | "unpaid" | "partial";

export type MembershipInviteGym = {
  id: string;
  name: string;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  timezone: string;
};

export type OptionalProfileAttribute = "GENDER" | "MEDICAL_NOTES";

export type OptionalClassGrant =
  | "PROGRESS"
  | "CALORIES"
  | "WEARABLES"
  | "DIET_PLANS"
  | "WORKOUT_PLANS";

export type AcceptMembershipInviteInput = {
  optionalProfileAttributes?: OptionalProfileAttribute[];
  optionalClassGrants?: OptionalClassGrant[];
};

export type MembershipInviteGrants = {
  profileAttributes: string[];
  classGrants: string[];
};

/** Client-owned grants for an ACTIVE membership gym. */
export type MyDataGrants = {
  gymOrgId: string;
  clientUserId: string;
  profileAttributes: string[];
  classGrants: string[];
};

export type UpdateMyDataGrantsInput = {
  optionalProfileAttributes?: OptionalProfileAttribute[];
  optionalClassGrants?: OptionalClassGrant[];
};

export type MembershipInvite = {
  id: string;
  gymOrgId: string;
  /** Present on CLIENT inbox responses. */
  gym?: MembershipInviteGym;
  invitedEmail: string;
  invitedUserId: string | null;
  inviteeName: string;
  inviteePhone: string | null;
  basePlanId: string;
  basePaymentStatus: MembershipPaymentStatus;
  addonPlanId: string | null;
  addonPaymentStatus: MembershipPaymentStatus | null;
  status: MembershipInviteStatus;
  expiresAt: string;
  createdBy: string;
  acceptedAt: string | null;
  acceptedMembershipId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MembershipInvitePage = {
  items: MembershipInvite[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateMembershipInviteInput = {
  inviteeName: string;
  invitedEmail: string;
  inviteePhone?: string;
  basePlanId: string;
  basePaymentStatus: MembershipPaymentStatus;
  addonPlanId?: string;
  addonPaymentStatus?: MembershipPaymentStatus;
  expiresAt?: string;
};

export type MembershipInvitesReader = {
  list: (input: {
    accessToken: string;
    gymOrgId: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ membershipInvites: MembershipInvitePage }>;

  listInbox: (input: {
    accessToken: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ membershipInvites: MembershipInvitePage }>;

  /** CLIENT + ACTIVE membership. Client owns grants — no staff DataGrant. */
  getMyDataGrants: (input: {
    accessToken: string;
    gymOrgId: string;
  }) => Promise<{ dataGrants: MyDataGrants }>;
};

export type MembershipInvitesWriter = {
  create: (input: {
    accessToken: string;
    gymOrgId: string;
    body: CreateMembershipInviteInput;
  }) => Promise<{ membershipInvite: MembershipInvite }>;

  revoke: (input: {
    accessToken: string;
    gymOrgId: string;
    membershipInviteId: string;
  }) => Promise<{ membershipInvite: MembershipInvite }>;

  accept: (input: {
    accessToken: string;
    membershipInviteId: string;
    body?: AcceptMembershipInviteInput;
  }) => Promise<{
    membershipInvite: MembershipInvite;
    membershipId: string;
    grants: MembershipInviteGrants;
  }>;

  /** CLIENT + ACTIVE membership. Sticky DOB/HEIGHT/WEIGHT stay server-side. */
  updateMyDataGrants: (input: {
    accessToken: string;
    gymOrgId: string;
    body: UpdateMyDataGrantsInput;
  }) => Promise<{ dataGrants: MyDataGrants }>;
};
