import {
  Contact,
  ContactField,
  ContactsSortOrder,
  getPermissionsAsync,
  requestPermissionsAsync,
  type ContactsPermissionResponse,
} from "expo-contacts";

export type InviteContact = {
  id: string;
  name: string;
  phone: string;
};

const MAX_CONTACTS = 6;
const PAGE_SIZE = 150;
const MAX_PAGES = 8;

const CONTACT_FIELDS = [
  ContactField.FULL_NAME,
  ContactField.GIVEN_NAME,
  ContactField.FAMILY_NAME,
  ContactField.COMPANY,
  ContactField.PHONES,
] as const;

function hasContactsAccess(permission: ContactsPermissionResponse): boolean {
  if (permission.granted) return true;
  return permission.accessPrivileges === "limited";
}

function pickName(details: {
  fullName?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  company?: string | null;
}): string | null {
  const fullName = details.fullName?.trim();
  if (fullName) return fullName;

  const composed = [details.givenName, details.familyName]
    .filter((part) => part?.trim())
    .join(" ")
    .trim();
  if (composed) return composed;

  const company = details.company?.trim();
  return company || null;
}

function pickPhone(phones?: { number?: string | null }[] | null): string | null {
  for (const entry of phones ?? []) {
    const digits = entry.number?.replace(/[^\d+]/g, "") ?? "";
    if (digits.length >= 7 && entry.number) {
      return entry.number.trim();
    }
  }
  return null;
}

export async function loadInviteContacts(): Promise<InviteContact[]> {
  let permission = await getPermissionsAsync();
  if (!hasContactsAccess(permission)) {
    permission = await requestPermissionsAsync();
  }
  if (!hasContactsAccess(permission)) {
    throw new Error("Contacts permission is needed to suggest invites.");
  }

  const picks: InviteContact[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < MAX_PAGES && picks.length < MAX_CONTACTS; page += 1) {
    const batch = await Contact.getAllDetails(CONTACT_FIELDS, {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      sortOrder: ContactsSortOrder.GivenName,
    });

    if (batch.length === 0) break;

    for (const details of batch) {
      const phone = pickPhone(details.phones);
      const name = pickName(details);
      if (!phone || !name) continue;

      if (seen.has(details.id)) continue;
      seen.add(details.id);

      picks.push({ id: details.id, name, phone });
      if (picks.length >= MAX_CONTACTS) break;
    }

    if (batch.length < PAGE_SIZE) break;
  }

  return picks;
}
