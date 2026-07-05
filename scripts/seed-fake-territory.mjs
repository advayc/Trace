#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { cellToLatLng, gridDisk, gridRing, latLngToCell } from "h3-js";

const H3_RESOLUTION = 10;
const DEFAULT_FAKE_COUNT = 4;

function parseArgs(argv) {
  const args = {
    lat: null,
    lng: null,
    count: DEFAULT_FAKE_COUNT,
    forUserId: null,
    forUserEmail: null,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === "--lat" && next) {
      args.lat = Number(next);
      i += 1;
      continue;
    }
    if (token === "--lng" && next) {
      args.lng = Number(next);
      i += 1;
      continue;
    }
    if (token === "--count" && next) {
      const parsed = Number(next);
      if (Number.isFinite(parsed)) {
        args.count = Math.max(1, Math.min(12, Math.round(parsed)));
      }
      i += 1;
      continue;
    }
    if (token === "--for-user-id" && next) {
      args.forUserId = next;
      i += 1;
      continue;
    }
    if (token === "--for-user-email" && next) {
      args.forUserEmail = next.toLowerCase();
      i += 1;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      printHelpAndExit(0);
    }
  }

  if (!Number.isFinite(args.lat) || !Number.isFinite(args.lng)) {
    printHelpAndExit(1);
  }

  return args;
}

function printHelpAndExit(code) {
  const lines = [
    "Seed fake nearby territory around a map center.",
    "",
    "Required:",
    "  --lat <number>           Center latitude",
    "  --lng <number>           Center longitude",
    "",
    "Optional:",
    `  --count <1-12>            Fake user count (default ${DEFAULT_FAKE_COUNT})`,
    "  --for-user-id <uuid>      Real user who should be friended",
    "  --for-user-email <email>  Real user email to resolve",
    "  --dry-run                 Print plan without writing",
    "",
    "Env vars:",
    "  SUPABASE_URL",
    "  SUPABASE_SERVICE_ROLE_KEY",
  ];

  console.log(lines.join("\n"));
  process.exit(code);
}

function makeFakeDefinitions(count) {
  const names = [
    "Maya Park",
    "Jules Rivera",
    "Noah Chen",
    "Ava Singh",
    "Luca Rossi",
    "Eli Brooks",
    "Sora Kim",
    "Nia Flores",
    "Kai Turner",
    "Leah Morgan",
    "Theo Patel",
    "Milo Park",
  ];

  return Array.from({ length: count }, (_, index) => {
    const displayName = names[index % names.length];
    const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    return {
      displayName,
      username: `demo_${slug}_${String(index + 1).padStart(2, "0")}`,
      email: `demo.walker.${index + 1}@trace.local`,
      iconPreset: `icon:${["figure.walk", "figure.hiking", "leaf.fill", "star.fill"][index % 4]}|hue:${[24, 142, 195, 330][index % 4]}`,
    };
  });
}

function makeTerritoryCells(centerCell, index) {
  const ringDistance = 2 + index * 2;
  const ring = ringDistance <= 0 ? [centerCell] : gridRing(centerCell, ringDistance);
  const anchorCell = ring.length > 0 ? ring[(index * 5) % ring.length] : centerCell;
  const primaryRadius = 2 + (index % 2);
  const secondaryRadius = 1 + (index % 3 === 0 ? 1 : 0);

  const [anchorLat, anchorLng] = cellToLatLng(anchorCell);
  const secondaryCenter = latLngToCell(anchorLat + 0.00065, anchorLng - 0.00045, H3_RESOLUTION);

  const cells = new Set([...gridDisk(anchorCell, primaryRadius), ...gridDisk(secondaryCenter, secondaryRadius)]);
  return Array.from(cells);
}

async function getAuthUserByEmail(admin, email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const match = users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function ensureFakeAuthUser(admin, fake) {
  const existing = await getAuthUserByEmail(admin, fake.email);
  if (existing) {
    return existing;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: fake.email,
    password: "trace-demo-account",
    email_confirm: true,
    user_metadata: {
      full_name: fake.displayName,
      preferred_username: fake.username,
    },
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
  });
  if (error) throw error;
  return data.user;
}

async function upsertFakeProfile(admin, userId, fake) {
  const { error } = await admin
    .from("profiles")
    .update({
      display_name: fake.displayName,
      username: fake.username,
      provider: "email",
      avatar_url: fake.iconPreset,
    })
    .eq("id", userId);
  if (error) throw error;
}

async function ensureAcceptedFriendship(admin, userA, userB) {
  const { data, error } = await admin
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(
      `and(requester_id.eq.${userA},addressee_id.eq.${userB}),and(requester_id.eq.${userB},addressee_id.eq.${userA})`,
    );

  if (error) throw error;

  const edge = (data ?? []).find(
    (row) =>
      (row.requester_id === userA && row.addressee_id === userB) ||
      (row.requester_id === userB && row.addressee_id === userA),
  );

  if (!edge) {
    const { error: insertError } = await admin
      .from("friendships")
      .insert({ requester_id: userA, addressee_id: userB, status: "accepted" });
    if (insertError) throw insertError;
    return;
  }

  if (edge.status !== "accepted") {
    const { error: updateError } = await admin
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", edge.id);
    if (updateError) throw updateError;
  }
}

async function upsertTiles(admin, userId, cells) {
  const now = new Date();
  const rows = cells.map((h3Index, i) => ({
    user_id: userId,
    h3_index: h3Index,
    first_stomped_at: new Date(now.getTime() - (cells.length - i) * 360000).toISOString(),
    last_stomped_at: new Date(now.getTime() - i * 150000).toISOString(),
    visit_count: 1 + (i % 3),
  }));

  const { error } = await admin
    .from("stomped_tiles")
    .upsert(rows, { onConflict: "user_id,h3_index", ignoreDuplicates: false });
  if (error) throw error;
}

async function resolveTargetUserId(admin, args, fakeEmails) {
  if (args.forUserId) return args.forUserId;

  if (args.forUserEmail) {
    const match = await getAuthUserByEmail(admin, args.forUserEmail);
    if (!match?.id) {
      throw new Error(`Could not find auth user for email: ${args.forUserEmail}`);
    }
    return match.id;
  }

  let page = 1;
  const perPage = 200;
  const fakeSet = new Set(fakeEmails.map((email) => email.toLowerCase()));

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = (data?.users ?? []).filter((u) => {
      const email = (u.email ?? "").toLowerCase();
      return email && !fakeSet.has(email);
    });
    users.sort((a, b) => {
      const aTs = new Date(a.last_sign_in_at ?? a.created_at ?? 0).getTime();
      const bTs = new Date(b.last_sign_in_at ?? b.created_at ?? 0).getTime();
      return bTs - aTs;
    });
    if (users[0]?.id) return users[0].id;
    if ((data?.users ?? []).length < perPage) break;
    page += 1;
  }

  return null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const centerCell = latLngToCell(args.lat, args.lng, H3_RESOLUTION);
  const fakes = makeFakeDefinitions(args.count);
  const targetUserId = await resolveTargetUserId(
    admin,
    args,
    fakes.map((f) => f.email),
  );

  if (!targetUserId) {
    throw new Error(
      "Could not infer your real user. Pass --for-user-id <uuid> or --for-user-email <email>.",
    );
  }

  console.log(`Center: ${args.lat}, ${args.lng} (H3 r${H3_RESOLUTION} ${centerCell})`);
  console.log(`Target user: ${targetUserId}`);
  console.log(`Fake users: ${fakes.length}`);

  for (let i = 0; i < fakes.length; i += 1) {
    const fake = fakes[i];
    const cells = makeTerritoryCells(centerCell, i);

    console.log(`- ${fake.username}: ${cells.length} cells`);

    if (args.dryRun) continue;

    const fakeAuthUser = await ensureFakeAuthUser(admin, fake);
    await upsertFakeProfile(admin, fakeAuthUser.id, fake);
    await ensureAcceptedFriendship(admin, targetUserId, fakeAuthUser.id);
    await upsertTiles(admin, fakeAuthUser.id, cells);
  }

  if (args.dryRun) {
    console.log("Dry run complete (no writes).\n");
    return;
  }

  console.log("Seeding complete. Pull to refresh Friends + map overlays to visualize territory.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
